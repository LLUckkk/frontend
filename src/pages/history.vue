<template>
  <v-card flat border="0">
    <!-- 任务详情弹窗 -->
    <v-dialog v-model="showDetail" fullscreen>
      <task-detail v-if="showDetail" :task="currentTask" @close="showDetail = false" />
    </v-dialog>

    <v-card-title class="d-flex align-center pa-0">
      检测历史
      <v-spacer></v-spacer>
      <v-btn variant="outlined" class="mr-2" @click="showSelection = !showSelection"
        :color="showSelection ? 'primary' : undefined">
        {{ showSelection ? '取消选择' : '批量选择' }}
      </v-btn>
      <v-btn variant="outlined">新建</v-btn>
    </v-card-title>

    <v-card-text class="pa-0 mt-4">
      <v-data-table v-model="selected" :headers="headers" :items="tasks" :items-per-page="10" class="elevation-1"
        :show-select="showSelection" item-value="id">
        <!-- 进度条列自定义 -->
        <template v-slot:item.progress="{ item }">
          <div class="d-flex justify-center">
            <v-progress-linear :model-value="item.progress" :color="getProgressColor(item.progress)" height="20"
              style="width: 90%">
              <template v-slot:default="{ value }">
                <span>{{ Math.ceil(value) }}%</span>
              </template>
            </v-progress-linear>
          </div>
        </template>

        <!-- 操作列自定义 -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center gap-2">
            <v-btn size="small" color="primary" variant="text" @click="handleDetail(item)">
              任务详情
            </v-btn>
            <v-btn size="small" color="primary" variant="text" @click="handleDownload(item)">
              下载
            </v-btn>
            <v-btn size="small" color="warning" variant="text" @click="handleUrge(item)">
              催一催
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表格列定义
const headers = [
  { title: '任务ID', key: 'id', align: 'center' as const, width: '120px' },
  { title: '发布时间', key: 'publishTime', align: 'center' as const, width: '180px' },
  { title: '审稿人', key: 'reviewer', align: 'center' as const, width: '100px' },
  { title: '完成情况', key: 'progress', align: 'center' as const, width: '200px' },
  { title: '操作', key: 'actions', sortable: false, align: 'center' as const, width: '350px' }
]

// 模拟任务数据
const tasks = ref([
  {
    id: 'TASK2024001',
    publishTime: '2024-01-01 12:00:00',
    reviewer: '张三',
    progress: 0,
  },
  {
    id: 'TASK2024002',
    publishTime: '2024-01-01 13:00:00',
    reviewer: '李四',
    progress: 100,
  },
  {
    id: 'TASK2024003',
    publishTime: '2024-01-01 14:30:00',
    reviewer: '王五',
    progress: 35,
  },
  {
    id: 'TASK2024004',
    publishTime: '2024-01-01 15:45:00',
    reviewer: '赵六',
    progress: 100,
  },
  {
    id: 'TASK2024005',
    publishTime: '2024-01-02 09:15:00',
    reviewer: '张三',
    progress: 80,
  },
  {
    id: 'TASK2024006',
    publishTime: '2024-01-02 10:30:00',
    reviewer: '李四',
    progress: 0,
  },
  {
    id: 'TASK2024007',
    publishTime: '2024-01-02 11:45:00',
    reviewer: '王五',
    progress: 60,
  },
  {
    id: 'TASK2024008',
    publishTime: '2024-01-02 14:20:00',
    reviewer: '赵六',
    progress: 100,
  },
  {
    id: 'TASK2024009',
    publishTime: '2024-01-03 09:00:00',
    reviewer: '张三',
    progress: 25,
  },
  {
    id: 'TASK2024010',
    publishTime: '2024-01-03 10:15:00',
    reviewer: '李四',
    progress: 100,
  },
  {
    id: 'TASK2024011',
    publishTime: '2024-01-03 11:30:00',
    reviewer: '王五',
    progress: 45,
  },
  {
    id: 'TASK2024012',
    publishTime: '2024-01-03 14:00:00',
    reviewer: '赵六',
    progress: 0,
  },
  {
    id: 'TASK2024013',
    publishTime: '2024-01-04 09:30:00',
    reviewer: '张三',
    progress: 90,
  },
  {
    id: 'TASK2024014',
    publishTime: '2024-01-04 10:45:00',
    reviewer: '李四',
    progress: 100,
  },
  {
    id: 'TASK2024015',
    publishTime: '2024-01-04 13:15:00',
    reviewer: '王五',
    progress: 70,
  }
])

// 选择相关状态
const showSelection = ref(false)
const selected = ref([])

// 控制详情页显示
const showDetail = ref(false)
const currentTask = ref<any>(null)

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress === 100) return 'success'
  if (progress > 0) return 'warning'
  return 'error'
}

// 操作按钮处理函数
const handleDetail = (item: any) => {
  router.push(`/task/${item.id}`)
}

const handleDownload = (item: any) => {
  console.log('下载', item)
}

const handleUrge = (item: any) => {
  console.log('催一催', item)
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
