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
      <v-btn variant="outlined" class="mr-2" @click="showSelection = !showSelection"
        :color="showSelection ? 'primary' : undefined">
        {{ showSelection ? '取消选择' : '批量选择' }}
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
              <v-select v-model="filters.progress" :items="progressOptions" variant="outlined" density="compact"
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
        class="elevation-1" :show-select="showSelection" item-value="id">
        <!-- 任务状态列自定义 -->
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
      </v-data-table>

      <!-- 批量操作按钮 -->
      <v-fade-transition>
        <v-card v-if="showSelection && selected.length > 0" class="batch-actions" elevation="2">
          <v-card-text class="d-flex align-center">
            <span class="mr-4">已选择 {{ selected.length }} 项</span>
            <v-btn color="primary" variant="text" @click="handleBatchDownload">
              批量下载
            </v-btn>
            <v-btn color="error" variant="text" @click="handleBatchDelete">
              批量删除
            </v-btn>
          </v-card-text>
        </v-card>
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import publisher from '@/api/publisher'

const router = useRouter()
const snackbar = useSnackbarStore()

// 表格列定义
const headers = [
  { title: '任务ID', key: 'task_id', align: 'center' as const, width: '120px' },
  { title: '上传时间', key: 'upload_time', align: 'center' as const, width: '180px' },
  { title: '检测状态', key: 'status', align: 'center' as const, width: '200px' },
  { title: '操作', key: 'actions', sortable: false, align: 'center' as const, width: '350px' }
]

// 模拟任务数据
// const tasks = ref([
//   {
//     id: 'TASK2024001',
//     publishTime: '2024-01-01 12:00:00',
//     reviewer: '张三',
//     progress: 0,
//   },
//   {
//     id: 'TASK2024002',
//     publishTime: '2024-01-01 13:00:00',
//     reviewer: '李四',
//     progress: 100,
//   },
//   {
//     id: 'TASK2024003',
//     publishTime: '2024-01-01 14:30:00',
//     reviewer: '王五',
//     progress: 35,
//   },
//   {
//     id: 'TASK2024004',
//     publishTime: '2024-01-01 15:45:00',
//     reviewer: '赵六',
//     progress: 100,
//   },
//   {
//     id: 'TASK2024005',
//     publishTime: '2024-01-02 09:15:00',
//     reviewer: '张三',
//     progress: 80,
//   },
//   {
//     id: 'TASK2024006',
//     publishTime: '2024-01-02 10:30:00',
//     reviewer: '李四',
//     progress: 0,
//   },
//   {
//     id: 'TASK2024007',
//     publishTime: '2024-01-02 11:45:00',
//     reviewer: '王五',
//     progress: 60,
//   },
//   {
//     id: 'TASK2024008',
//     publishTime: '2024-01-02 14:20:00',
//     reviewer: '赵六',
//     progress: 100,
//   },
//   {
//     id: 'TASK2024009',
//     publishTime: '2024-01-03 09:00:00',
//     reviewer: '张三',
//     progress: 25,
//   },
//   {
//     id: 'TASK2024010',
//     publishTime: '2024-01-03 10:15:00',
//     reviewer: '李四',
//     progress: 100,
//   },
//   {
//     id: 'TASK2024011',
//     publishTime: '2024-01-03 11:30:00',
//     reviewer: '王五',
//     progress: 45,
//   },
//   {
//     id: 'TASK2024012',
//     publishTime: '2024-01-03 14:00:00',
//     reviewer: '赵六',
//     progress: 0,
//   },
//   {
//     id: 'TASK2024013',
//     publishTime: '2024-01-04 09:30:00',
//     reviewer: '张三',
//     progress: 90,
//   },
//   {
//     id: 'TASK2024014',
//     publishTime: '2024-01-04 10:45:00',
//     reviewer: '李四',
//     progress: 100,
//   },
//   {
//     id: 'TASK2024015',
//     publishTime: '2024-01-04 13:15:00',
//     reviewer: '王五',
//     progress: 70,
//   }
// ])
const tasks = ref<any>([])
onMounted(async () => {
  try {
    tasks.value = (await publisher.getAllDetectionTask()).data
    console.log(tasks.value)
  } catch (error) {
    snackbar.showMessage('获取检测任务失败', 'error')
  }
})

const getStatus = (status:string) => {
  switch(status){
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

const getStatusColor = (status:string) => {
  switch(status){
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
  progress: null as number | null
})

const dateError = ref('')

const progressOptions = [
  { title: '未开始', value: 0 },
  { title: '进行中', value: 1 },
  { title: '已完成', value: 2 }
] as const

// 判断是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.startDate ||
    filters.value.endDate ||
    filters.value.progress !== null
})

// 筛选后的任务列表
const filteredTasks = computed(() => {
  let result = [...tasks.value]

  // 应用日期筛选
  if (filters.value.startDate) {
    result = result.filter(task => {
      const taskDate = new Date(task.publishTime)
      const startDate = new Date(filters.value.startDate)
      return taskDate >= startDate
    })
  }

  if (filters.value.endDate) {
    result = result.filter(task => {
      const taskDate = new Date(task.publishTime)
      const endDate = new Date(filters.value.endDate)
      return taskDate <= endDate
    })
  }

  // 应用完成情况筛选
  if (filters.value.progress !== null) {
    result = result.filter(task => {
      switch (filters.value.progress) {
        case 0: // 未开始
          return task.progress === 0
        case 1: // 进行中
          return task.progress > 0 && task.progress < 100
        case 2: // 已完成
          return task.progress === 100
        default:
          return true
      }
    })
  }

  return result
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
}

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    progress: null
  }
}

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress === 100) return 'success'
  if (progress > 0) return 'warning'
  return 'error'
}

// 操作按钮处理函数
const handleNext = (item: any) => {
  router.push(`/step/${item.id}`)
}

const handleDelete = (item: any) => {
  console.log('删除', item)
}

// 批量操作处理函数
const handleBatchDownload = () => {
  console.log('批量下载', selected.value)
}

const handleBatchDelete = () => {
  console.log('批量删除', selected.value)
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