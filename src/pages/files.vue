<template>
    <!-- 标题 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">图像管理</h1>
      </v-col>
    </v-row>

    <!-- 搜索和筛选区域 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="8" md="6">
        <v-text-field
          v-model="searchQuery"
          label="搜索出版社名"
          append-inner-icon="mdi-magnify"
          clearable
          density="compact"
          hide-details
          class="search-input"
          @keyup.enter="handleSearch"
          @click:append-inner="handleSearch"
          @click:clear="handleSearch"
          placeholder="请输入出版社名"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4" md="6" class="d-flex justify-end">
        <v-btn 
          color="primary" 
          class="text-none mr-2" 
          prepend-icon="mdi-filter-variant"
          @click="showFilterDialog = true"
        >
          筛选
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="files"
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
              共 {{ totalFiles }} 条记录
            </div>
          </div>
        </template>

        <template v-slot:item.subject="{ item }">
          <v-chip
            :color="getSubjectColor(item.subject)"
            size="small"
            class="subject-chip"
          >
            {{ getSubjectName(item.subject) }}
          </v-chip>
        </template>

        <template v-slot:item.uploadTime="{ item }">
          {{ formatTime(item.uploadTime) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            class="mr-2"
            @click="openDetailDialog(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="error"
            @click="openDeleteDialog(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
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
              v-model="filters.subject"
              :items="subjectOptions"
              item-title="title"
              item-value="value"
              label="学科"
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

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">确认删除</v-card-title>
        <v-card-text>
          确定要删除该上传记录吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">取消</v-btn>
          <v-btn color="error" @click="deleteFile">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 详情对话框 -->
    <v-dialog v-model="showDetailDialog" max-width="1200">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">上传详情</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <!-- 筛选条件 -->
            <div class="d-flex align-center gap-4">
              <v-select
                v-model="detailFilters.aiChecked"
                :items="[
                  { title: '全部', value: null },
                  { title: '已检测', value: true },
                  { title: '未检测', value: false }
                ]"
                label="AI检测状态"
                density="compact"
                hide-details
                style="width: 150px"
              ></v-select>
              <v-select
                v-model="detailFilters.manuallyChecked"
                :items="[
                  { title: '全部', value: null },
                  { title: '已审核', value: true },
                  { title: '未审核', value: false }
                ]"
                label="人工审核状态"
                density="compact"
                hide-details
                style="width: 150px"
              ></v-select>
              <v-select
                v-model="detailFilters.result"
                :items="[
                  { title: '全部', value: null },
                  { title: '真实', value: true },
                  { title: '虚假', value: false }
                ]"
                label="检测结果"
                density="compact"
                hide-details
                style="width: 150px"
              ></v-select>
            </div>

            <!-- 图片网格 -->
            <v-row>
              <v-col
                v-for="(image, index) in filteredDetailImages"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card class="image-card" @click="openImageDialog(image)">
                  <v-img
                    :src="image.url"
                    aspect-ratio="1"
                    cover
                    class="image-thumbnail"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                  <v-card-text class="pt-2">
                    <div class="d-flex justify-space-between align-center">
                      <div class="text-caption">
                        <v-icon
                          :color="image.aiChecked ? 'success' : 'error'"
                          size="small"
                          class="mr-1"
                        >
                          {{ image.aiChecked ? 'mdi-check-circle' : 'mdi-close-circle' }}
                        </v-icon>
                        AI检测
                      </div>
                      <div class="text-caption">
                        <v-icon
                          :color="image.manuallyChecked ? 'success' : 'error'"
                          size="small"
                          class="mr-1"
                        >
                          {{ image.manuallyChecked ? 'mdi-check-circle' : 'mdi-close-circle' }}
                        </v-icon>
                        人工审核
                      </div>
                    </div>
                    <div class="text-caption mt-1">
                      <v-icon
                        :color="image.result ? 'success' : 'error'"
                        size="small"
                        class="mr-1"
                      >
                        {{ image.result ? 'mdi-check-circle' : 'mdi-close-circle' }}
                      </v-icon>
                      {{ image.result ? '真实' : '虚假' }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDetailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 图片查看对话框 -->
    <v-dialog v-model="showImageDialog" max-width="800">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">图片详情</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column align-center">
            <v-img
              :src="selectedImage?.url"
              max-height="500"
              contain
              class="mb-4"
            ></v-img>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-center">
                <v-icon
                  :color="selectedImage?.aiChecked ? 'success' : 'error'"
                  size="small"
                  class="mr-1"
                >
                  {{ selectedImage?.aiChecked ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>AI检测状态：{{ selectedImage?.aiChecked ? '已检测' : '未检测' }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon
                  :color="selectedImage?.manuallyChecked ? 'success' : 'error'"
                  size="small"
                  class="mr-1"
                >
                  {{ selectedImage?.manuallyChecked ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>人工审核状态：{{ selectedImage?.manuallyChecked ? '已审核' : '未审核' }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon
                  :color="selectedImage?.result ? 'success' : 'error'"
                  size="small"
                  class="mr-1"
                >
                  {{ selectedImage?.result ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>检测结果：{{ selectedImage?.result ? '真实' : '虚假' }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="deleteSingleImage">删除图片</v-btn>
          <v-btn color="grey" variant="text" @click="showImageDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import fileApi from '@/api/file'

const snackbar = useSnackbarStore()

interface File {
  id: number
  username: string
  subject: string
  uploadTime: number
  images: Image[]
}

interface Image {
  id: number
  url: string
  aiChecked: boolean
  manuallyChecked: boolean
  result: boolean
}

const headers = [
  // { title: '编号', key: 'id', align: 'center' },
  { title: '出版社名', key: 'username', align: 'start' },
  { title: '学科', key: 'subject', align: 'start' },
  { title: '上传时间', key: 'uploadTime', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
] as const

// 分页相关
const files = ref<File[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalFiles = ref(0)
const totalPages = ref(1)

// 搜索相关
const searchQuery = ref('')

// 筛选相关
const showFilterDialog = ref(false)
const filters = ref<{
  subject: string | null
  timeRange: string | null
  startDate: string | null
  endDate: string | null
}>({
  subject: null,
  timeRange: null,
  startDate: null,
  endDate: null
})

const subjectOptions = [
  { title: '生物', value: 'Biology' },
  { title: '医学', value: 'Medicine' },
  { title: '化学', value: 'Chemistry' },
  { title: '图形学', value: 'Graphics' },
  { title: '其他', value: 'Other' }
]

const timeRangeOptions = [
  { title: '最近一天', value: '1d' },
  { title: '最近一周', value: '7d' },
  { title: '最近一月', value: '30d' },
  { title: '最近三月', value: '90d' },
  { title: '最近一年', value: '365d' }
]

// 详情相关
const showDetailDialog = ref(false)
const selectedFile = ref<File | null>(null)
const detailFilters = ref<{
  aiChecked: boolean | null
  manuallyChecked: boolean | null
  result: boolean | null
}>({
  aiChecked: null,
  manuallyChecked: null,
  result: null
})

// 图片查看相关
const showImageDialog = ref(false)
const selectedImage = ref<Image | null>(null)

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  pageSize.value = 10
  fetchFiles(1, 10)
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchFiles(page, pageSize.value)
}

// 处理每页数量变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchFiles(1, size)
}

// 处理时间范围变化
const handleTimeRangeChange = (value: string | null) => {
  if (value) {
    filters.value.startDate = null
    filters.value.endDate = null
    timeError.value = ''
  }
}

// 处理自定义时间变化
const timeError = ref('')
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
    subject: null,
    timeRange: null,
    startDate: null,
    endDate: null
  }
  timeError.value = ''
  currentPage.value = 1
  pageSize.value = 10
  fetchFiles(1, 10)
  showFilterDialog.value = false
}

// 应用筛选条件
const applyFilters = () => {
  if (timeError.value) {
    return
  }
  
  currentPage.value = 1
  pageSize.value = 10
  fetchFiles(1, 10)
  showFilterDialog.value = false
}

// 打开详情对话框
const openDetailDialog = (file: File) => {
  selectedFile.value = file
  showDetailDialog.value = true
}

// 打开删除对话框
const showDeleteDialog = ref(false)
const openDeleteDialog = (file: File) => {
  selectedFile.value = file
  showDeleteDialog.value = true
}

// 删除文件
const deleteFile = async () => {
  if (selectedFile.value) {
    try {
      // 调用后端删除上传记录 API
      const id = selectedFile.value.id
      await fileApi.deleteFile(id)
      // 从列表中移除已删除的文件
      files.value = files.value.filter(f => f.id !== id)
      snackbar.showMessage('删除成功', 'success')
    } catch (error) {
      console.error('删除失败:', error)
      snackbar.showMessage('删除失败', 'error')
    }
  }
  showDeleteDialog.value = false
}

// 打开图片对话框
const openImageDialog = (image: Image) => {
  selectedImage.value = image
  showImageDialog.value = true
}

// 删除单张图片
const deleteSingleImage = async () => {
  if (selectedImage.value && selectedFile.value) {
    try {
      // TODO: 调用删除图片API
      selectedFile.value.images = selectedFile.value.images.filter(
        img => img.id !== selectedImage.value!.id
      )
      snackbar.showMessage('图片删除成功', 'success')
      showImageDialog.value = false
    } catch (error) {
      console.error('删除图片失败:', error)
      snackbar.showMessage('删除图片失败', 'error')
    }
  }
}

// 过滤详情图片
const filteredDetailImages = computed(() => {
  if (!selectedFile.value) return []
  
  return selectedFile.value.images.filter(image => {
    if (detailFilters.value.aiChecked !== null && image.aiChecked !== detailFilters.value.aiChecked) {
      return false
    }
    if (detailFilters.value.manuallyChecked !== null && image.manuallyChecked !== detailFilters.value.manuallyChecked) {
      return false
    }
    if (detailFilters.value.result !== null && image.result !== detailFilters.value.result) {
      return false
    }
    return true
  })
})

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 时间筛选格式化，用于生成后端可识别的时间字符串
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

// 从后端获取文件数据
const fetchFiles = async (page: number, pageSize: number) => {
  loading.value = true
  try {
    // 计算时间筛选
    let startTimeFilter: string | undefined
    let endTimeFilter: string | undefined
    if (filters.value.timeRange) {
      const now = Date.now()
      const ranges: Record<string, number> = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '365d': 365 * 24 * 60 * 60 * 1000
      }
      const rangeMs = ranges[filters.value.timeRange as keyof typeof ranges]
      startTimeFilter = formatDateFilter(now - rangeMs)
      endTimeFilter = formatDateFilter(now)
    } else if (filters.value.startDate && filters.value.endDate) {
      startTimeFilter = formatDateFilter(new Date(filters.value.startDate).getTime())
      endTimeFilter = formatDateFilter(new Date(filters.value.endDate).getTime())
    }

    const params = {
      page,
      page_size: pageSize,
      query: searchQuery.value || '',
      categories: filters.value.subject || '',
      startTime: startTimeFilter,
      endTime: endTimeFilter
    }
    const response = await fileApi.getFiles(params)
    const { files: fileList, current_page, total_pages, total_files } = response.data
    
    // 转换后端数据格式为前端格式
    files.value = fileList.map((file: any) => ({
      id: file.id,
      username: file.username,
      subject: file.tag,
      uploadTime: new Date(file.upload_time).getTime(),
      images: [
        {
          id: file.id,
          url: file.file_url || '',
          aiChecked: file.ai_checked || false,
          manuallyChecked: file.manually_checked || false,
          result: file.result || false
        }
      ]
    }))


    
    currentPage.value = current_page
    totalPages.value = total_pages
    totalFiles.value = total_files
  } catch (error) {
    console.error('获取文件数据失败:', error)
    snackbar.showMessage('获取文件数据失败', 'error')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchFiles(currentPage.value, pageSize.value)
})

const getSubjectColor = (subject: string) => {
  switch (subject) {
    case 'Biology':
      return 'success'
    case 'Medicine':
      return 'info'
    case 'Chemistry':
      return 'warning'
    case 'Graphics':
      return 'primary'
    case 'Other':
      return 'grey'
    default:
      return 'grey'
  }
}

const getSubjectName = (subject: string) => {
  switch (subject) {
    case 'Biology':
      return '生物'
    case 'Medicine':
      return '医学'
    case 'Chemistry':
      return '化学'
    case 'Graphics':
      return '图形学'
    case 'Other':
      return '其他'
    default:
      return subject
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  overflow: hidden;
}

.subject-chip {
  font-size: 12px;
  padding: 0 12px;
  font-weight: 500;
}

.v-btn.v-btn--size-small {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
}

.v-btn--icon.v-btn--size-small .v-icon {
  font-size: 18px;
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

.search-input {
  max-width: 400px;
}

:deep(.v-text-field .v-field__input) {
  min-height: 40px;
}

:deep(.v-btn--variant-outlined) {
  border-color: rgb(var(--v-theme-outline));
}

:deep(.v-select .v-field__input) {
  min-height: 40px;
}

:deep(.v-select .v-field__append-inner) {
  padding-top: 0;
}

.image-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.image-card:hover {
  transform: scale(1.02);
}

.image-thumbnail {
  border-radius: 8px;
}
</style>
