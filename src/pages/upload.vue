<template>
    <!-- 上传页面内容 -->
    <div v-show="!showProgress">
      <v-row>
        <v-col cols="12" lg="9">
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="h-100" :class="{ 'border border-primary': selectedVersion === 'free' }" @click="selectedVersion = 'free'">
                <v-card-title class="text-h6">基础版</v-card-title>
                <v-card-subtitle>0元/张</v-card-subtitle>
                <v-card-text>
                  <div class="text-body-2 mb-4">适用于个人图片检测</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <div class="text-primary">AI模型</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-primary">基础版</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持格式</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">JPG/PNG</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>免费额度</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">每天5张</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>检测精度</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="warning">mdi-star</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" :class="{ 'border border-primary': selectedVersion === 'pro' }" @click="selectedVersion = 'pro'">
                <v-card-title class="text-h6">专业版</v-card-title>
                <v-card-subtitle>1元/张</v-card-subtitle>
                <v-card-text>
                  <div class="text-body-2 mb-4">适用于批量图片检测</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <div class="text-primary">AI模型</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-primary">专业版</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持格式</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">全格式</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>极速检测</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="success">mdi-check</v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>检测精度</div>
                      </template>
                      <template v-slot:append>
                        <div class="d-flex">
                          <v-icon color="warning">mdi-star</v-icon>
                          <v-icon color="warning">mdi-star</v-icon>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" :class="{ 'border border-primary': selectedVersion === 'premium' }" @click="selectedVersion = 'premium'">
                <v-card-title class="text-h6">至尊版</v-card-title>
                <v-card-subtitle>定制价格</v-card-subtitle>
                <v-card-text>
                  <div class="text-body-2 mb-4">适用于工业级图片检测</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <div class="text-primary">AI模型</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-primary">尊贵定制</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持格式</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">全格式</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>检测极速</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="success">mdi-check</v-icon>
                        <v-icon color="success">mdi-check</v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>检测精度</div>
                      </template>
                      <template v-slot:append>
                        <div class="d-flex">
                          <v-icon color="warning">mdi-star</v-icon>
                          <v-icon color="warning">mdi-star</v-icon>
                          <v-icon color="warning">mdi-star</v-icon>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-6">
            <v-col cols="12">
              <v-card>
                <v-card-text class="text-center">
                  <div v-if="!selectedFiles.length" 
                    class="upload-area pa-8" 
                    @dragover.prevent 
                    @drop.prevent="handleDrop"
                    @click="triggerFileInput"
                  >
                    <v-icon size="64" color="grey">mdi-cloud-upload</v-icon>
                    <div class="text-h6 mt-4">点击或拖拽图片/文件到此处上传</div>
                    <div class="text-caption text-grey">支持格式：JPG、PNG、PDF、ZIP等常见文件格式，单个文件不超过10MB</div>
                    <input
                      type="file"
                      ref="fileInput"
                      style="display: none"
                      @change="handleFileSelect"
                      accept=".jpg,.jpeg,.png,.pdf,.zip"
                    >
                  </div>
                  <div v-else class="file-preview pa-4">
                    <v-row>
                      <v-col cols="12" md="6" class="mx-auto">
                        <v-card>
                          <v-card-text class="d-flex align-center">
                            <v-icon size="48" color="primary" class="mr-4">mdi-file</v-icon>
                            <div>
                              <div class="text-h6">{{ selectedFiles[0].name }}</div>
                              <div class="text-caption text-grey">
                                {{ formatFileSize(selectedFiles[0].size) }}
                              </div>
                            </div>
                            <v-spacer></v-spacer>
                            <v-btn
                              icon="mdi-close"
                              variant="text"
                              @click="selectedFiles = []"
                            ></v-btn>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end">
              <v-btn 
                color="primary" 
                size="large" 
                :loading="loading"
                @click="handleSubmit"
              >
                {{ loading ? '处理中...' : '提交检测' }}
                <template v-slot:loader>
                  <v-progress-circular
                    indeterminate
                    color="white"
                    size="24"
                  ></v-progress-circular>
                </template>
                <v-icon v-if="!loading" end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" lg="3">
          <v-card>
            <v-card-title class="d-flex align-center">
              实时检测动态
              <v-spacer></v-spacer>
              <v-btn icon="mdi-chevron-left" variant="text" density="compact"></v-btn>
              <v-btn icon="mdi-chevron-right" variant="text" density="compact"></v-btn>
            </v-card-title>
            <v-card-text>
              <v-timeline density="compact" align="start">
                <v-timeline-item
                  v-for="(item, index) in timelineItems"
                  :key="index"
                  dot-color="primary"
                  size="small"
                >
                  <div class="d-flex align-center">
                    <v-avatar size="32" class="mr-3">
                      <v-img :src="item.avatar" cover></v-img>
                    </v-avatar>
                    <div>
                      <div class="d-flex align-center">
                        <span class="text-body-2">{{ item.name }}</span>
                        <v-chip
                          size="x-small"
                          :color="item.tagColor"
                          class="ml-2"
                          label
                        >{{ item.tag }}</v-chip>
                      </div>
                      <div class="text-caption text-grey">
                        {{ item.count }}张图片 平均造假率: {{ item.rate }}
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 进度页面内容 -->
    <div v-show="showProgress" class="upload-progress">
      <!-- 返回按钮 -->
      <div class="d-flex align-center mb-6">
        <v-btn 
          icon="mdi-arrow-left" 
          variant="text" 
          @click="returnToUpload" 
          class="mr-2 return-btn"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="text-h6 font-weight-medium">返回上传</span>
      </div>

      <v-stepper v-model="currentStep">
        <!-- 步骤指示器 -->
        <v-stepper-header>
          <v-stepper-item
            :value="1"
            title="选择图片"
            :complete="currentStep > 1"
          ></v-stepper-item>

          <v-divider></v-divider>

          <v-stepper-item
            :value="2"
            title="AI检测"
            :complete="currentStep > 2"
          ></v-stepper-item>

          <v-divider></v-divider>

          <v-stepper-item
            :value="3"
            title="发布审核"
            :complete="currentStep > 3"
          ></v-stepper-item>
        </v-stepper-header>

        <!-- 步骤内容 -->
        <v-stepper-window>
          <!-- 第一步：选择图片 -->
          <v-stepper-window-item :value="1">
            <ImageSelectionStep 
              :images="extractedImages"
              :fileId="fileId"
              @update="updateSelectedImages"
            />
          </v-stepper-window-item>

          <!-- 第二步：AI检测 -->
          <v-stepper-window-item :value="2">
            <DetectionStep />
          </v-stepper-window-item>

          <!-- 第三步：发布审核 -->
          <v-stepper-window-item :value="3">
            <ReviewStep @update="updateReviewData" />
          </v-stepper-window-item>
        </v-stepper-window>

        <!-- 底部按钮 -->
        <v-card-actions>
          <v-btn
            variant="text"
            @click="previousStep"
            :disabled="currentStep === 1"
          >
            上一步
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="nextStep"
            :disabled="!canProceed"
          >
            {{ currentStep === 3 ? '完成' : '下一步' }}
          </v-btn>
        </v-card-actions>
      </v-stepper>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import uploadApi from '@/api/upload'
import { useSnackbarStore } from '@/stores/snackbar'
import ImageSelectionStep from '@/components/steps/ImageSelectionStep.vue'
import DetectionStep from '@/components/steps/DetectionStep.vue'
import ReviewStep from '@/components/steps/ReviewStep.vue'

const router = useRouter()
const selectedVersion = ref<'free' | 'pro' | 'premium' | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const fileId = ref<string>('')
const loading = ref<boolean>(false)
const snackbar = useSnackbarStore()

// 进度页面相关状态
const showProgress = ref(false)
const currentStep = ref(1)
const extractedImages = ref<Image[]>([])
const selectedImages = ref<Image[]>([])

interface Image {
  image_id: number
  image_url: string
  page_number?: number
  extracted_from_pdf: boolean
  selected: boolean
}

interface ReviewData {
  selectedFakeImages: any[]
  selectedRealImages: any[]
  selectedReviewers: any[]
}

const reviewData = ref<ReviewData>({
  selectedFakeImages: [],
  selectedRealImages: [],
  selectedReviewers: []
})

const timelineItems = ref([
  {
    name: 'zhw',
    avatar: '/avatars/default.png',
    tag: '个人用户',
    tagColor: 'warning',
    count: '10',
    rate: '30%'
  },
  {
    name: 'hhh',
    avatar: '/avatars/default.png',
    tag: '至尊用户',
    tagColor: 'error',
    count: '240',
    rate: '15%'
  },
  {
    name: 'wyt',
    avatar: '/avatars/default.png',
    tag: '个人用户',
    tagColor: 'warning',
    count: '21',
    rate: '45%'
  },
  {
    name: 'md',
    avatar: '/avatars/default.png',
    tag: '至尊用户',
    tagColor: 'error',
    count: '521',
    rate: '25%'
  }
])

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (isValidFile(file)) {
      selectedFiles.value = [file]
    } else {
      snackbar.showMessage('不支持的文件格式，请上传 JPG、PNG 、PDF或 ZIP 文件', 'error')
    }
  }
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const file = files[0]
    if (isValidFile(file)) {
      selectedFiles.value = [file]
    } else {
      snackbar.showMessage('不支持的文件格式，请上传 JPG、PNG 、PDF或 ZIP 文件', 'error')
    }
  }
}

const isValidFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip', 'application/x-zip-compressed']
  const maxSize = 10 * 1024 * 1024 // 10MB
  return validTypes.includes(file.type) && file.size <= maxSize
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!selectedVersion.value) {
    snackbar.showMessage('请选择检测版本', 'error')
    return
  }
  
  if (!selectedFiles.value.length) {
    snackbar.showMessage('请选择要上传的文件', 'error')
    return 
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFiles.value[0])

    const { data } = await uploadApi.uploadFile(formData)
    console.log(data)
    fileId.value = data.file_id
    snackbar.showMessage('文件上传成功，正在处理中...', 'success')
    
    // 获取提取的图片
    const { data: imagesData } = await uploadApi.getExtractedImages(data.file_id)
    extractedImages.value = imagesData.images.map((img: any) => ({
      image_id: img.image_id,
      image_url: import.meta.env.VITE_API_URL + img.image_url,
      page_number: img.page_number,
      extracted_from_pdf: img.extracted_from_pdf,
      selected: false
    }))
    
    // 显示进度页面并重置为第一步
    showProgress.value = true
    currentStep.value = 1
  } catch (error) {
    console.error('Upload failed:', error)
    snackbar.showMessage('文件上传失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// 进度页面相关方法
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedImages.value.length > 0
    case 3:
      const { selectedFakeImages, selectedRealImages, selectedReviewers } = reviewData.value
      const hasSelectedImages = selectedFakeImages.length > 0 || selectedRealImages.length > 0
      return hasSelectedImages && selectedReviewers.length > 0
    default:
      return true
  }
})

const updateSelectedImages = (images: typeof extractedImages.value) => {
  selectedImages.value = images
}

const updateReviewData = (data: ReviewData) => {
  reviewData.value = data
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    if (canProceed.value) {
      router.push(`/task/${fileId.value}`)
    }
  }
}

// 添加返回上传页面的方法
const returnToUpload = () => {
  showProgress.value = false
  // 清空文件
  selectedFiles.value = []
  // 重置其他状态
  selectedVersion.value = null
  fileId.value = ''
  extractedImages.value = []
  selectedImages.value = []
  currentStep.value = 1
  reviewData.value = {
    selectedFakeImages: [],
    selectedRealImages: [],
    selectedReviewers: []
  }
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.05);
}

.border {
  border-width: 2px !important;
  border-style: solid !important;
}

.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.v-timeline-item {
  margin-bottom: 16px;
}

.v-timeline-item:last-child {
  margin-bottom: 0;
}

.file-preview {
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 8px;
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-btn--loading {
  opacity: 1;
}

.upload-progress {
  position: relative;
  min-height: 100vh;
  max-height: 300vh;
  background-color: rgb(var(--v-theme-surface));
  overflow: hidden;
}

.v-stepper {
  box-shadow: none;
}
</style>