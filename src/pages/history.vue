<template>
  <v-card flat border="0">
    <!-- 任务详情弹窗 -->
    <v-dialog v-model="showDetail" max-width="800" persistent>
      <task-detail v-if="showDetail" :task="currentTask" @close="showDetail = false" />
    </v-dialog>

    <v-card-title class="d-flex align-center pa-0">
      <h1 class="text-h4 font-weight-bold">检测历史</h1>
      <v-spacer></v-spacer>
      <v-btn variant="outlined" class="mr-2" @click="showFilter = true"
        :color="hasActiveFilters ? 'primary' : undefined">
        <v-icon class="mr-2">mdi-filter</v-icon>
        筛选
      </v-btn>
      <!-- <v-btn variant="outlined">新建</v-btn> -->
    </v-card-title>

    <!-- 筛选对话框 -->
    <v-dialog v-model="showFilter" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          筛选条件
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showFilter = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">上传时间</div>
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="filters.startDate" label="开始日期" type="date" variant="outlined"
                    density="compact" hide-details clearable @update:model-value="validateDateRange"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="filters.endDate" label="结束日期" type="date" variant="outlined" density="compact"
                    hide-details clearable @update:model-value="validateDateRange"></v-text-field>
                </v-col>
              </v-row>
              <v-alert v-if="dateError" type="error" density="compact" class="mt-2">
                {{ dateError }}
              </v-alert>
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">完成情况</div>
              <v-select v-model="filters.status" :items="statusOptions" variant="outlined" density="compact"
                hide-details clearable></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="applyFilters" :disabled="!!dateError">
            应用
          </v-btn>
          <v-btn color="error" variant="text" @click="resetFilters">重置</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card-text class="pa-0 mt-4">
      <v-data-table v-model="selected" :headers="headers" :items="filteredTasks" :items-per-page="10"
        class="elevation-1" :show-select="showSelection" item-value="id" hide-default-footer>
        <!-- 任务状态列自定义 -->
        <template v-slot:item.task_id="{ item }">
          <span>{{ item.task_id }}</span>
        </template>

        <template v-slot:item.upload_time="{ item }">
          <span>{{ formatDateTime(item.upload_time) }}</span>
        </template>

        <template v-slot:item.completion_time="{ item }">
          <span>{{ formatDateTime(item.completion_time) }}</span>
        </template>

        <template v-slot:item.status="{ item }">
          <div class="d-flex justify-center">
            <v-chip :color="getStatusColor(item.status)" size="small" class="operation-chip">
              {{ getStatus(item.status) }}
            </v-chip>
          </div>
        </template>

        <!-- 操作列自定义 -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center gap-2">
            <v-btn size="small" color="primary" variant="text" @click="handleNext(item)"
              :disabled="item.status !== 'completed'">
              下一步
            </v-btn>
            <v-btn size="small" color="error" variant="text" @click="handleDelete(item)">
              删除
            </v-btn>
          </div>
        </template>

        <template v-slot:top>
          <div class="d-flex align-center pa-4">
            <div class="text-caption text-medium-emphasis">
              共 {{ totalTasks }} 条记录
            </div>
          </div>
        </template>
      </v-data-table>

      <div class="d-flex align-center justify-center pa-4">
        <div class="d-flex align-center">
          <span class="text-caption mr-2">每页显示</span>
          <v-select v-model="pageSize" :items="[5, 10, 20, 50, 100]" density="compact" variant="outlined" hide-details
            style="width: 100px" @update:model-value="handlePageSizeChange"></v-select>
          <span class="text-caption ml-2">条</span>
        </div>
        <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" class="ml-4"
          @update:model-value="handlePageChange"></v-pagination>
      </div>

    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import publisher from '@/api/publisher'

const router = useRouter()
const snackbar = useSnackbarStore()

// 分页相关
const pageSize = ref(10)
const currentPage = ref(1)
const totalTasks = ref(0)
const totalPages = ref(1)
const loading = ref(false)

// 表格列定义
const headers = [
  { title: '任务ID', key: 'task_id', align: 'center' as const, width: '120px' },
  { title: '上传时间', key: 'upload_time', align: 'center' as const, width: '180px' },
  { title: '完成时间', key: 'completion_time', align: 'center' as const, width: '180px' },
  { title: '检测状态', key: 'status', align: 'center' as const, width: '200px' },
  { title: '操作', key: 'actions', sortable: false, align: 'center' as const, width: '350px' }
]

interface Task {
  task_id: string
  upload_time: string
  completion_time: string
  status: 'pending' | 'in_progress' | 'completed'
}

// 任务数据
const tasks = ref<Task[]>([])

// 从后端获取任务数据
const fetchTasks = async (page: number, pageSize: number) => {
  loading.value = true
  try {
    let startTimeFilter: string | undefined
    let endTimeFilter: string | undefined

    if (filters.value.startDate && filters.value.endDate) {
      startTimeFilter = formatDateFilter(new Date(filters.value.startDate).getTime())
      endTimeFilter = formatDateFilter(new Date(filters.value.endDate).getTime())
    }

    const params = {
      page,
      page_size: pageSize,
      status: filters.value.status || '',
      startTime: startTimeFilter,
      endTime: endTimeFilter
    }
    const response = await publisher.getAllDetectionTask(params)
    const { tasks: taskList, current_page, total_pages, total } = response.data

    tasks.value = taskList.map((task: any) => ({
      task_id: task.task_id,
      upload_time: task.upload_time,
      completion_time: task.completion_time,
      status: task.status
    }))

    currentPage.value = current_page
    totalPages.value = total_pages
    totalTasks.value = total
  } catch (error) {
    console.error('获取任务列表失败:', error)
    snackbar.showMessage('获取任务列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTasks(page, pageSize.value)
}

// 处理每页数量变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  fetchTasks(1, size)
}

// 时间格式化，用于筛选条件
const formatDateFilter = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 初始化
onMounted(() => {
  fetchTasks(currentPage.value, pageSize.value)
})

const getStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return '排队中'
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
    default:
      return '未知'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'yellow'
    case 'in_progress':
      return 'info'
    case 'completed':
      return 'success'
    default:
      return 'grey'
  }
}

// 选择相关状态
const showSelection = ref(false)
const selected = ref([])

// 控制详情页显示
const showDetail = ref(false)
const currentTask = ref<any>(null)

// 筛选相关
const showFilter = ref(false)
const filters = ref({
  startDate: '',
  endDate: '',
  status: null as string | null
})

const dateError = ref('')

const statusOptions = [
  { title: '排队中', value: 'pending' },
  { title: '进行中', value: 'in_progress' },
  { title: '已完成', value: 'completed' }
] as const

// 判断是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.startDate ||
    filters.value.endDate ||
    filters.value.status !== null
})

// 筛选后的任务列表
const filteredTasks = computed(() => {
  return tasks.value
})

const validateDateRange = () => {
  if (filters.value.startDate && filters.value.endDate) {
    const startDate = new Date(filters.value.startDate)
    const endDate = new Date(filters.value.endDate)

    if (startDate > endDate) {
      dateError.value = '结束日期不能早于开始日期'
      return false
    }
  }
  dateError.value = ''
  return true
}

const applyFilters = () => {
  if (!validateDateRange()) {
    return
  }
  showFilter.value = false
  // 重置到第一页并重新获取数据
  currentPage.value = 1
  fetchTasks(1, pageSize.value)
}

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    status: null
  }
  // 重置到第一页并重新获取数据
  currentPage.value = 1
  fetchTasks(1, pageSize.value)
}

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress === 100) return 'success'
  if (progress > 0) return 'warning'
  return 'error'
}

// 操作按钮处理函数
const handleNext = (item: Task) => {
  console.log(item.task_id)
  router.push(`/step/${item.task_id}`)
}

const handleDelete = (item: Task) => {
  console.log('删除', item)
}

// 时间格式化函数
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

</script>

<style scoped>
.v-data-table {
  width: 100%;
}

.batch-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
}
</style>