<template>
  <v-container>
    <!-- 标题 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">日志管理</h1>
      </v-col>
    </v-row>

    <!-- 组织选择和统计信息 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="8" md="6">
        <v-autocomplete
          v-model="selectedOrg"
          :items="orgList"
          :loading="loadingOrgs"
          item-title="name"
          item-value="id"
          label="选择组织"
          prepend-icon="mdi-office-building"
          return-object
          clearable
          hide-details
          @update:model-value="handleOrgChange"
        >
          <template v-slot:selection="{ item }">
            <v-chip class="ma-1">
              {{ item.raw.name }}
              <v-avatar start size="24" class="mr-2">
                <v-img :src="getImageUrl(item.raw.logo)" cover></v-img>
              </v-avatar>
            </v-chip>
          </template>
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.description">
              <template v-slot:prepend>
                <v-avatar size="24" class="mr-2">
                  <v-img :src="getImageUrl(item.raw.logo)" cover></v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" sm="4" md="6" class="d-flex justify-end">
        <v-btn color="primary" class="text-none mr-2" prepend-icon="mdi-filter-variant" @click="showFilterDialog = true">
          筛选
        </v-btn>
        <v-btn color="success" class="text-none" prepend-icon="mdi-download" @click="showDownloadDialog = true">
          下载日志
        </v-btn>
      </v-col>
    </v-row>

    <!-- 统计卡片 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="large" class="mr-3">mdi-upload</v-icon>
              <div>
                <div class="text-h6">{{ stats.uploadLogs }}</div>
                <div class="text-caption">上传操作数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="large" class="mr-3">mdi-robot</v-icon>
              <div>
                <div class="text-h6">{{ stats.detectionLogs }}</div>
                <div class="text-caption">检测操作数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="large" class="mr-3">mdi-file-document-edit</v-icon>
              <div>
                <div class="text-h6">{{ stats.reviewRequestLogs }}</div>
                <div class="text-caption">审核请求数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="large" class="mr-3">mdi-account-check</v-icon>
              <div>
                <div class="text-h6">{{ stats.manualReviewLogs }}</div>
                <div class="text-caption">人工审核数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="logs"
        class="elevation-0"
        :items-per-page="pageSize"
        hover
        :width="'100%'"
        :loading="loading"
        hide-default-footer
      >
        <template v-slot:top>
          <div class="d-flex align-center pa-4">
            <div class="text-caption text-medium-emphasis">
              共 {{ totalLogs }} 条记录
            </div>
          </div>
        </template>

        <template v-slot:item.operation_type="{ item }">
          <v-chip :color="getOperationTypeColor(item.operation_type)" size="small" class="operation-chip">
            {{ getOperationType(item.operation_type) }}
          </v-chip>
        </template>

        <template v-slot:item.related_model="{ item }">
          <v-chip :color="getModelColor(item.related_model)" size="small" class="model-chip">
            {{ getRelatedModel(item.related_model) }}
          </v-chip>
        </template>
      </v-data-table>

      <div class="d-flex align-center justify-center pa-4">
        <div class="d-flex align-center">
          <span class="text-caption mr-2">每页显示</span>
          <v-select
            v-model="pageSize"
            :items="[5, 10, 20, 50, 100]"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 100px"
            @update:model-value="handlePageSizeChange"
          ></v-select>
          <span class="text-caption ml-2">条</span>
        </div>
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          class="ml-4"
          @update:model-value="handlePageChange"
        ></v-pagination>
      </div>
    </v-card>

    <!-- 筛选对话框 -->
    <v-dialog v-model="showFilterDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">筛选条件</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-select
              v-model="filters.operationType"
              :items="operationTypeOptions"
              label="操作类型"
              clearable
              hide-details
            ></v-select>

            <v-select
              v-model="filters.timeRange"
              :items="timeRangeOptions"
              label="快速选择时间范围"
              clearable
              hide-details
              @update:model-value="handleTimeRangeChange"
            ></v-select>

            <div class="d-flex align-center gap-4">
              <v-text-field
                v-model="filters.startDate"
                label="开始时间"
                type="datetime-local"
                hide-details
                density="compact"
                :error-messages="timeError"
                @update:model-value="handleCustomTimeChange"
              ></v-text-field>
              <v-text-field
                v-model="filters.endDate"
                label="结束时间"
                type="datetime-local"
                hide-details
                density="compact"
                :error-messages="timeError"
                @update:model-value="handleCustomTimeChange"
              ></v-text-field>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="resetFilters">重置</v-btn>
          <v-btn color="primary" @click="applyFilters">应用</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 下载对话框 -->
    <v-dialog v-model="showDownloadDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">下载日志</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-select
              v-model="downloadFilters.operationType"
              :items="operationTypeOptions"
              label="操作类型"
              clearable
              hide-details
            ></v-select>

            <v-select
              v-model="downloadFilters.timeRange"
              :items="timeRangeOptions"
              label="快速选择时间范围"
              clearable
              hide-details
              @update:model-value="handleDownloadTimeRangeChange"
            ></v-select>

            <div class="d-flex align-center gap-4">
              <v-text-field
                v-model="downloadFilters.startDate"
                label="开始时间"
                type="datetime-local"
                hide-details
                density="compact"
                :error-messages="downloadTimeError"
                @update:model-value="handleDownloadCustomTimeChange"
              ></v-text-field>
              <v-text-field
                v-model="downloadFilters.endDate"
                label="结束时间"
                type="datetime-local"
                hide-details
                density="compact"
                :error-messages="downloadTimeError"
                @update:model-value="handleDownloadCustomTimeChange"
              ></v-text-field>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="resetDownloadFilters">重置</v-btn>
          <v-btn color="success" @click="downloadLogs">下载</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { mockApi } from '@/mock/logs-adm'

const snackbar = useSnackbarStore()

interface Organization {
  id: number
  name: string
  description: string
  logo: string
}

interface Log {
  id: number
  user: string
  operation_type: string
  related_model: string
  related_id: number
  operation_time: string
  organization_id: number
}

interface LogStats {
  totalLogs: number
  uploadLogs: number
  detectionLogs: number
  reviewRequestLogs: number
  manualReviewLogs: number
}

interface ApiResponse<T> {
  data: T
}

const headers = [
  { title: '操作用户', key: 'user', align: 'start' },
  { title: '操作类型', key: 'operation_type', align: 'center' },
  { title: '相关模型', key: 'related_model', align: 'center' },
  { title: '相关ID', key: 'related_id', align: 'center' },
  { title: '操作时间', key: 'operation_time', align: 'center' },
] as const

// 组织相关
const orgList = ref<Organization[]>([])
const loadingOrgs = ref(false)
const selectedOrg = ref<Organization | null>(null)

// 统计信息
const stats = ref<LogStats>({
  totalLogs: 0,
  uploadLogs: 0,
  detectionLogs: 0,
  reviewRequestLogs: 0,
  manualReviewLogs: 0
})

// 分页相关
const logs = ref<Log[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(0)
const totalPages = ref(1)

// 筛选相关
const showFilterDialog = ref(false)
const filters = ref<{
  operationType: string | null
  timeRange: string | null
  startDate: string | null
  endDate: string | null
}>({
  operationType: null,
  timeRange: null,
  startDate: null,
  endDate: null
})

const operationTypeOptions = [
  { title: '上传图像', value: 'upload' },
  { title: 'AI检测', value: 'detection' },
  { title: '发布审核', value: 'review_request' },
  { title: '提交审核', value: 'manual_review' }
]

const timeRangeOptions = [
  { title: '最近一天', value: '1d' },
  { title: '最近一周', value: '7d' },
  { title: '最近一月', value: '30d' },
  { title: '最近三月', value: '90d' },
  { title: '最近一年', value: '365d' }
]

// 时间验证相关
const timeError = ref('')

// 处理组织变化
const handleOrgChange = () => {
  currentPage.value = 1
  pageSize.value = 10
  fetchLogs(1, 10)
  fetchStats()
}

// 处理快速选择时间范围变化
const handleTimeRangeChange = (value: string | null) => {
  if (value) {
    filters.value.startDate = null
    filters.value.endDate = null
    timeError.value = ''
  }
}

// 处理自定义时间变化
const handleCustomTimeChange = () => {
  filters.value.timeRange = null

  if (!filters.value.startDate || !filters.value.endDate) {
    timeError.value = '开始时间和结束时间不能为空'
    return
  }

  const startTime = new Date(filters.value.startDate).getTime()
  const endTime = new Date(filters.value.endDate).getTime()

  if (startTime >= endTime) {
    timeError.value = '开始时间必须早于结束时间'
  } else {
    timeError.value = ''
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    operationType: null,
    timeRange: null,
    startDate: null,
    endDate: null
  }
  timeError.value = ''
  currentPage.value = 1
  pageSize.value = 10
  fetchLogs(1, 10)
  showFilterDialog.value = false
}

// 应用筛选条件
const applyFilters = () => {
  if (timeError.value) {
    return
  }

  currentPage.value = 1
  pageSize.value = 10
  fetchLogs(1, 10)
  showFilterDialog.value = false
}

// 获取组织列表
const fetchOrgs = async () => {
  loadingOrgs.value = true
  try {
    const response = await mockApi.getOrganizations() as ApiResponse<{ organizations: Organization[] }>
    orgList.value = response.data.organizations
  } catch (error) {
    console.error('获取组织列表失败:', error)
    snackbar.showMessage('获取组织列表失败', 'error')
  } finally {
    loadingOrgs.value = false
  }
}

// 获取统计信息
const fetchStats = async () => {
  try {
    const response = await mockApi.getLogStats({
      organization_id: selectedOrg.value?.id
    }) as ApiResponse<LogStats>
    stats.value = response.data
  } catch (error) {
    console.error('获取统计信息失败:', error)
    snackbar.showMessage('获取统计信息失败', 'error')
  }
}

// 从后端获取日志数据
const fetchLogs = async (page: number, pageSize: number) => {
  loading.value = true
  try {
    const params = {
      page,
      page_size: pageSize,
      organization_id: selectedOrg.value?.id,
      operation_type: filters.value.operationType || '',
      timeRange: filters.value.timeRange,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate
    }
    
    const response = await mockApi.getLogs(params) as ApiResponse<{
      logs: Log[]
      current_page: number
      total_pages: number
      total_logs: number
    }>
    
    logs.value = response.data.logs
    currentPage.value = response.data.current_page
    totalPages.value = response.data.total_pages
    totalLogs.value = response.data.total_logs
  } catch (error) {
    console.error('获取日志数据失败:', error)
    snackbar.showMessage('获取日志数据失败', 'error')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchLogs(page, pageSize.value)
}

// 处理每页数量变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchLogs(1, size)
}

const getOperationType = (type: string) => {
  switch (type) {
    case 'upload':
      return '上传图像'
    case 'detection':
      return 'AI检测'
    case 'review_request':
      return '发布审核'
    case 'manual_review':
      return '提交审核'
    default:
      return '未知'
  }
}

const getRelatedModel = (model: string) => {
  switch (model) {
    case 'DetectionTask':
      return "检测任务"
    case 'FileManagement':
      return "文件管理"
    case 'ReviewRequest':
      return "人工审核请求"
    case 'ManualReview':
      return "人工审核提交"
    default:
      return '未知'
  }
}

const getOperationTypeColor = (type: string) => {
  switch (type) {
    case 'upload':
      return 'info'
    case 'detection':
      return 'success'
    case 'review_request':
      return 'warning'
    case 'manual_review':
      return 'primary'
    default:
      return 'grey'
  }
}

const getModelColor = (model: string) => {
  switch (model) {
    case 'DetectionTask':
      return 'info'
    case 'FileManagement':
      return 'primary'
    case 'ReviewRequest':
      return 'warning'
    case 'ManualReview':
      return 'success'
    default:
      return 'grey'
  }
}

// 下载相关
const showDownloadDialog = ref(false)
const downloadFilters = ref<{
  operationType: string | null
  timeRange: string | null
  startDate: string | null
  endDate: string | null
}>({
  operationType: null,
  timeRange: null,
  startDate: null,
  endDate: null
})

const downloadTimeError = ref('')

// 处理下载时间范围变化
const handleDownloadTimeRangeChange = (value: string | null) => {
  if (value) {
    downloadFilters.value.startDate = null
    downloadFilters.value.endDate = null
    downloadTimeError.value = ''
  }
}

// 处理下载自定义时间变化
const handleDownloadCustomTimeChange = () => {
  downloadFilters.value.timeRange = null

  if (!downloadFilters.value.startDate || !downloadFilters.value.endDate) {
    downloadTimeError.value = '开始时间和结束时间不能为空'
    return
  }

  const startTime = new Date(downloadFilters.value.startDate).getTime()
  const endTime = new Date(downloadFilters.value.endDate).getTime()

  if (startTime >= endTime) {
    downloadTimeError.value = '开始时间必须早于结束时间'
  } else {
    downloadTimeError.value = ''
  }
}

// 重置下载筛选条件
const resetDownloadFilters = () => {
  downloadFilters.value = {
    operationType: null,
    timeRange: null,
    startDate: null,
    endDate: null
  }
  downloadTimeError.value = ''
  showDownloadDialog.value = false
}

// 下载日志
const downloadLogs = async () => {
  if (downloadTimeError.value) {
    return
  }

  try {
    const params = {
      organization_id: selectedOrg.value?.id,
      operation_type: downloadFilters.value.operationType || '',
      timeRange: downloadFilters.value.timeRange,
      startDate: downloadFilters.value.startDate,
      endDate: downloadFilters.value.endDate
    }

    const response = await mockApi.downloadLogs(params) as ApiResponse<string>
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `logs_${selectedOrg.value?.name || 'all'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    snackbar.showMessage('日志下载成功', 'success')
    showDownloadDialog.value = false
  } catch (error) {
    console.error('下载日志失败:', error)
    snackbar.showMessage('下载日志失败', 'error')
  }
}

const getImageUrl = (url: string) => {
  return import.meta.env.VITE_API_URL + url
}

// 初始化
onMounted(() => {
  fetchOrgs()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.operation-chip {
  font-size: 12px;
  padding: 0 12px;
  font-weight: 500;
}

.model-chip {
  font-size: 12px;
  padding: 0 12px;
  font-weight: 500;
}

:deep(.v-data-table) {
  border-radius: 12px;
  width: 100%;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

:deep(.v-data-table__tr td) {
  white-space: nowrap;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

:deep(.v-chip) {
  font-weight: 500;
}

:deep(.v-text-field .v-field__input) {
  min-height: 40px;
}

:deep(.v-select .v-field__input) {
  min-height: 40px;
}

:deep(.v-select .v-field__append-inner) {
  padding-top: 0;
}
</style>
