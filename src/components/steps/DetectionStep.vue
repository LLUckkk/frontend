<template>
  <v-container class="mt-8">
    <v-row>
      <v-col cols="12">
        <!-- 顶部信息卡片 -->
        <v-card class="mb-8 pa-6" elevation="2" rounded="lg">
          <v-row>
            <!-- 左侧进度环 -->
            <v-col cols="4" class="border-r">
              <div class="detection-summary">
                <v-progress-circular :model-value="(detectionResult.fakeCount / detectionResult.totalCount) * 100"
                  :size="160" :width="12" color="primary" class="custom-progress">
                  <div class="progress-content">
                    <div class="text-h4 font-weight-bold responsive-text">{{ detectionResult.fakeCount }}/{{
                      detectionResult.totalCount }}</div>
                    <div class="text-subtitle-2 mt-1 responsive-text">造假图片数量</div>
                  </div>
                </v-progress-circular>
              </div>
            </v-col>

            <!-- 右侧信息和按钮 -->
            <v-col cols="8" class="pl-8">
              <div class="d-flex flex-column justify-space-between h-100">
                <!-- 任务信息 -->
                <div class="task-info mb-8">
                  <div class="text-h6 mb-4">任务信息</div>
                  <div class="d-flex flex-column gap-2">
                    <div class="info-item d-flex align-center" :class="isDarkMode ? 'info-item-dark' : ''">
                      <v-icon :color="isDarkMode ? 'grey-lighten-1' : 'grey-darken-2'"
                        class="mr-2">mdi-clock-outline</v-icon>
                      <span class="text-body-1">检测时间：{{ detectionResult.detectionTime }}</span>
                    </div>
                    <div class="info-item d-flex align-center" :class="isDarkMode ? 'info-item-dark' : ''">
                      <v-icon :color="isDarkMode ? 'grey-lighten-1' : 'grey-darken-2'" class="mr-2">mdi-pound</v-icon>
                      <span class="text-body-1">检测编号：{{ detectionResult.detectionId }}</span>
                    </div>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="d-flex flex-wrap gap-4">
                  <v-btn color="primary" variant="elevated" class="px-8 py-2" rounded="pill"
                    prepend-icon="mdi-file-document-outline" elevation="2" @click="downloadReport">
                    查看报告
                  </v-btn>
                  <!-- <v-btn
                    color="grey-lighten-5"
                    variant="elevated"
                    class="px-8 py-2"
                    rounded="pill"
                    prepend-icon="mdi-download-outline"
                    elevation="2"
                  >
                    批量下载
                  </v-btn> -->
                  <v-btn :color="isDarkMode ? 'green-darken-2' : 'success'" variant="elevated" class="px-8 py-2"
                    rounded="pill" prepend-icon="mdi-check-circle" elevation="2" @click="completeDetection"
                    :disabled="!hasSelectedImages">
                    完成检测
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 图片展示区域 -->
        <v-row>
          <v-col cols="12">
            <!-- 疑似造假图片卡片 -->
            <v-card class="mb-6" elevation="2" rounded="lg">
              <v-card-title class="d-flex justify-space-between pa-6">
                <div class="d-flex align-center">
                  <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                  <span class="text-h6">疑似造假图片</span>
                  <v-chip color="error" class="ml-4" size="small">{{ selectedFakeCount }}/{{
                    detectionResult.fakeImages.length }}</v-chip>
                </div>
                <v-btn color="error" variant="text" @click="selectAllFake">
                  {{ isAllFakeSelected ? '取消全选' : '全选' }}
                </v-btn>
              </v-card-title>
              <v-card-text class="pa-6">
                <v-sheet class="overflow-x-auto">
                  <div class="d-flex image-grid">
                    <v-hover v-for="(img, index) in detectionResult.fakeImages" :key="index"
                      v-slot="{ isHovering, props }">
                      <v-card v-bind="props" class="ma-2 position-relative" width="200" height="200" elevation="2"
                        rounded="lg" @click="toggleImageSelection(img, 'fake')">
                        <v-img :src="getImageUrl(img.image_url)" cover height="100%">
                          <div class="image-overlay" v-if="isHovering || img.selected">
                            <div class="d-flex flex-column align-center gap-4">
                              <v-checkbox v-model="img.selected" color="primary" class="image-checkbox"></v-checkbox>
                              <v-btn icon="mdi-magnify" variant="text" color="white" size="large"
                                @click.stop="viewImageDetail(img)"></v-btn>
                            </div>
                          </div>
                        </v-img>
                      </v-card>
                    </v-hover>
                  </div>
                </v-sheet>
              </v-card-text>
            </v-card>

            <!-- 正常图片卡片 -->
            <v-card elevation="2" rounded="lg">
              <v-card-title class="d-flex justify-space-between pa-6">
                <div class="d-flex align-center">
                  <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                  <span class="text-h6">正常图片</span>
                  <v-chip color="success" class="ml-4" size="small">{{ selectedRealCount }}/{{
                    detectionResult.realImages.length }}</v-chip>
                </div>
                <v-btn color="success" variant="text" @click="selectAllReal">
                  {{ isAllRealSelected ? '取消全选' : '全选' }}
                </v-btn>
              </v-card-title>
              <v-card-text class="pa-6">
                <v-sheet class="overflow-x-auto">
                  <div class="d-flex image-grid">
                    <v-hover v-for="(img, index) in detectionResult.realImages" :key="index"
                      v-slot="{ isHovering, props }">
                      <v-card v-bind="props" class="ma-2 position-relative" width="200" height="200" elevation="2"
                        rounded="lg" @click="toggleImageSelection(img, 'real')">
                        <v-img :src="getImageUrl(img.image_url)" cover height="100%">
                          <div class="image-overlay" v-if="isHovering || img.selected">
                            <div class="d-flex flex-column align-center gap-4">
                              <v-checkbox v-model="img.selected" color="primary" class="image-checkbox"></v-checkbox>
                              <v-btn icon="mdi-magnify" variant="text" color="white" size="large"
                                @click.stop="viewImageDetail(img)"></v-btn>
                            </div>
                          </div>
                        </v-img>
                      </v-card>
                    </v-hover>
                  </div>
                </v-sheet>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 图片详情对话框 -->
    <v-dialog v-model="showImageDetail" max-width="1000">
      <v-card rounded="lg">
        <v-card-title class="pa-6 d-flex">
          <h1 class="text-h5">图片详情</h1>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showImageDetail = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <!-- 左侧图片信息 (保持原有样式) -->
            <!-- 图片展示区域 -->
            <v-col cols="12" md="6" class="pr-md-6">
              <div style="position: relative;">
                <v-img :src="getSelectedImageUrl(selectedImage)" max-height="500" contain class="rounded-lg"></v-img>

                <!-- 检测覆盖层 -->
                <transition name="fade">
                  <v-img v-if="activeOverlay" :src="activeOverlay" max-height="500" contain
                    class="rounded-lg overlay-image"></v-img>
                </transition>
              </div>

              <div class="mt-6">
                <div class="d-flex flex-column gap-2">
                  <div class="info-item d-flex align-center">
                    <v-icon color="grey" class="mr-2">mdi-clock-outline</v-icon>
                    <span class="text-body-1">检测时间：{{ detectionResult.detectionTime }}</span>
                  </div>
                  <div class="info-item d-flex align-center">
                    <v-icon color="grey" class="mr-2">mdi-pound</v-icon>
                    <span class="text-body-1">检测编号：{{ props.task_id }}</span>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- 右侧标签页 -->
            <v-col cols="12" md="6" class="pl-md-6">
              <v-tabs v-model="activeTab" color="primary">
                <v-tab value="analysis" style="font-size: 16px;">大模型</v-tab>
                <v-tab value="history" style="font-size: 16px;">深度学习</v-tab>
                <v-tab value="comments" style="font-size: 16px;">传统方法</v-tab>
              </v-tabs>

              <v-divider></v-divider>

              <v-window v-model="activeTab" class="mt-4">
                <v-window-item value="analysis">
                  <div class="text-h6 mb-4">大模型意见</div>
                  <!-- 这里放分析结果内容 -->
                  <v-card>
                    <v-card-text>{{ llm }}</v-card-text>
                  </v-card>
                  <!-- <v-text-field>{{ llm }}</v-text-field> -->
                </v-window-item>

                <v-window-item value="history">
                  <div class="text-h6 mb-4">深度学习模型结果</div>
                  <!-- 检测维度列表 -->
                  <v-list class="elevation-1 rounded-lg">
                    <v-list-item-group>
                      <template v-for="(dimension, index) in urn" :key="dimension.method">
                        <v-list-item class="py-2 px-3">
                          <div class="d-flex align-center" style="gap: 24px; width: 100%;">
                            <!-- 名称 -->
                            <div class="text-body-1 font-weight-medium" style="min-width: 100px;">
                              {{ dimension.method }}
                            </div>

                            <!-- 圆形进度条 -->
                            <v-progress-circular :model-value="dimension.probability * 100"
                              :color="getProbabilityColor(dimension.probability)" size="40" width="5">
                              <span class="text-caption">{{ (dimension.probability * 100).toFixed(0) }}%</span>
                            </v-progress-circular>

                            <!-- 操作按钮 -->
                            <v-btn size="small" color="primary" variant="text"
                              @click.stop="showOverlay(dimension.mask_image)">
                              <v-icon left>mdi-image-filter-center-focus</v-icon>
                              显示
                            </v-btn>
                          </div>
                        </v-list-item>

                        <v-divider v-if="index < urn.length - 1"></v-divider>
                      </template>
                    </v-list-item-group>
                  </v-list>


                </v-window-item>

                <v-window-item value="comments">
                  <div class="text-h6 mb-4">传统方法结果</div>
                  <!-- 检测结果卡片 -->
                  <v-card class="mb-4" elevation="2">
                    <v-card-text>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon :color="exif.photoshop_edited ? 'error' : 'success'">
                            {{ exif.photoshop_edited ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>是否经过PS处理</v-list-item-title>
                          <v-list-item-subtitle>
                            <span :class="exif.photoshop_edited ? 'error--text' : 'success--text'">
                              {{ exif.photoshop_edited ? '检测到PS痕迹' : '未检测到PS痕迹' }}
                            </span>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-divider class="my-2"></v-divider>

                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon :color="exif.time_modified ? 'error' : 'success'">
                            {{ exif.time_modified ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>是否经过时间修改</v-list-item-title>
                          <v-list-item-subtitle>
                            <span :class="exif.time_modified ? 'error--text' : 'success--text'">
                              {{ exif.time_modified ? '检测到时间篡改' : '未检测到时间修改' }}
                            </span>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useSnackbarStore } from '@/stores/snackbar'
import publisher from '@/api/publisher'

interface Image {
  result_id: string
  image_url: string
  selected?: boolean
}

interface DetectionResult {
  detectionTime: string
  detectionId: string
  totalCount: number
  fakeCount: number
  fakeImages: Image[]
  realImages: Image[]
}

const snackbar = useSnackbarStore()
const theme = useTheme()
const emit = defineEmits(['complete'])
const isDarkMode = computed(() => theme.global.current.value.dark)
const activeTab = ref('analysis')
const llm = ref('')
const ela = ref()
const urn = ref()
const exif = ref()
const activeOverlay = ref()

const downloadReport = async () => {
  try {
    const response = await publisher.downloadReport(props.task_id)
    const contentDisposition = response.headers['content-disposition']

    let fileName = `task_${props.task_id}_report.pdf`
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) fileName = match[1];
    }

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url); // 释放内存 
  } catch (error) {
    snackbar.showMessage('报告下载失败', 'error')
  }
}

// 模拟检测结果数据
const detectionResult = ref<DetectionResult>({
  detectionTime: '',
  detectionId: '',
  totalCount: 0,
  fakeCount: 0,
  fakeImages: [],
  realImages: []
})

const props = withDefaults(defineProps<{
  task_id?: string
  detection_time?: string
}>(), {
  task_id: '',
  detection_time: ''
})

onMounted(async () => {
  // 从本地存储加载主题设置
  try {
    detectionResult.value.fakeImages = (await publisher.getFakeImage({ task_id: props.task_id, include_image: 1 })).data.results
    detectionResult.value.realImages = (await publisher.getNormalImage({ task_id: props.task_id, include_image: 1 })).data.results
    detectionResult.value.fakeCount = detectionResult.value.fakeImages.length
    detectionResult.value.totalCount = detectionResult.value.realImages.length + detectionResult.value.fakeCount
  } catch (error) {
    snackbar.showMessage('获取检测结果失败', 'error')
  }
})

const showImageDetail = ref(false)
const selectedImage = ref<Image | null>(null)


const fetchImageDetection = async (result_id: string) => {
  try {
    const responese = (await publisher.getSingleImageResult(result_id)).data
    llm.value = responese.llm
    ela.value = responese.ela_image
    urn.value = responese.sub_methods
    detectionResult.value.detectionTime = responese.timestamps
    exif.value = responese.exif
    console.log(urn.value)
  } catch (error) {
    snackbar.showMessage('获取图片检测结果失败', 'error')
  }
}

const viewImageDetail = (image: Image) => {
  selectedImage.value = image
  showImageDetail.value = true
  fetchImageDetection(image.result_id)
}

const showOverlay = (imageUrl: string) => {
  activeOverlay.value = imageUrl
}

const getProbabilityColor = (probability: number): string => {
  if (probability > 0.8) return "red"
  if (probability > 0.5) return "orange"
  return "green"
}

const getSelectedImageUrl = (selectedImage: Image | null) => {
  if (selectedImage) {
    console.log(import.meta.env.VITE_API_URL + selectedImage.image_url)
    return import.meta.env.VITE_API_URL + selectedImage.image_url
  } else {
    console.log('no selected')
    return ''
  }
}

const getImageUrl = (url: string) => {
  return import.meta.env.VITE_API_URL + url
}

const completeDetection = () => {
  // 触发完成事件
  emit('complete')
}

const selectedFakeCount = ref(0)
const selectedRealCount = ref(0)
const isAllFakeSelected = ref(false)
const isAllRealSelected = ref(false)

const selectAllFake = () => {
  isAllFakeSelected.value = !isAllFakeSelected.value
  detectionResult.value.fakeImages.forEach(img => img.selected = isAllFakeSelected.value)
  selectedFakeCount.value = isAllFakeSelected.value ? detectionResult.value.fakeImages.length : 0
}

const selectAllReal = () => {
  isAllRealSelected.value = !isAllRealSelected.value
  detectionResult.value.realImages.forEach(img => img.selected = isAllRealSelected.value)
  selectedRealCount.value = isAllRealSelected.value ? detectionResult.value.realImages.length : 0
}

const toggleImageSelection = (image: Image, type: string) => {
  if (type === 'fake') {
    image.selected = !image.selected
    if (image.selected) {
      selectedFakeCount.value++
    } else {
      selectedFakeCount.value--
    }
  } else {
    image.selected = !image.selected
    if (image.selected) {
      selectedRealCount.value++
    } else {
      selectedRealCount.value--
    }
  }
}

const hasSelectedImages = computed(() => selectedFakeCount.value > 0 || selectedRealCount.value > 0)
</script>

<style scoped>
.v-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 调整各列宽度 */
.dimension-name {
  min-width: 120px;
}

.dimension-probability {
  min-width: 200px;
}

/* 进度条内部文字样式 */
.v-progress-linear__content {
  font-size: 0.75rem;
}

.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  mix-blend-mode: multiply;
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.detection-summary {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.custom-progress {
  --v-progress-circular-size: 160px;
  --v-progress-circular-underlay-color: v-bind(isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5');
  transition: all 0.3s ease;
}

.border-r {
  border-right: 1px solid #e5e7eb;
}

.image-grid {
  gap: 16px;
  padding-bottom: 8px;
  min-width: fit-content;
}

.v-sheet {
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-item {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item-dark {
  background-color: rgba(255, 255, 255, 0.05);
}

.responsive-text {
  font-size: clamp(1rem, 2vw, 1.5rem);
}

.text-subtitle-2.responsive-text {
  font-size: clamp(0.75rem, 1.5vw, 1rem);
}
</style>