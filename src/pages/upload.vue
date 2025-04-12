<template>
  <v-container>
    
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
                :disabled="!selectedVersion || !selectedFiles.length || loading" 
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
  
  </v-container>
  <app-snackbar ref="snackbar"></app-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import uploadApi from '@/api/upload'
import AppSnackbar from '@/components/AppSnackbar.vue'

const router = useRouter()
const selectedVersion = ref<'free' | 'pro' | 'premium' | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const fileId = ref<string>('')
const loading = ref<boolean>(false)
const snackbar = ref<InstanceType<typeof AppSnackbar> | null>(null)

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
      snackbar.value?.open('不支持的文件格式，请上传 JPG、PNG 、PDF或 ZIP 文件', 'error')
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
      snackbar.value?.open('不支持的文件格式，请上传 JPG、PNG 、PDF或 ZIP 文件', 'error')
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
    snackbar.value?.open('请选择检测版本', 'error')
    return
  }
  
  if (!selectedFiles.value.length) {
    snackbar.value?.open('请选择要上传的文件', 'error')
    return
  }

  loading.value = true
  try {
    // 模拟延时
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const formData = new FormData()
    formData.append('file', selectedFiles.value[0])

    // const { data } = await uploadApi.uploadFile(formData)
    // console.log(data)
    // fileId.value = data.file_id
    let data = 1
    snackbar.value?.open('文件上传成功，正在处理中...', 'success')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    router.push(`/progress/${data}`)
  } catch (error) {
    console.error('Upload failed:', error)
    snackbar.value?.open('文件上传失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
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
</style> 