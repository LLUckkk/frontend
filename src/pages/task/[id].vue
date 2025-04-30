<template>
  <div class="task-detail pa-4">
    <!-- 返回按钮 -->
    <div class="d-flex align-center mb-6">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        @click="router.back()" 
        class="mr-2 return-btn"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 font-weight-medium">返回检测历史</span>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content rounded-lg">
      <!-- 顶部信息区域 -->
      <div class="info-section pa-6">
        <div class="content-wrapper d-flex justify-center">
          <div class="content-container">
            <div class="info-content d-flex align-center justify-space-between pa-4">
              <!-- 左侧进度和标签 -->
              <div class="d-flex align-center" style="min-width: 320px">
                <div class="progress-circle mr-3 elevation-1">
                  <!-- <span class="text-h5 font-weight-bold primary--text">{{ taskData?.progress }}%</span> -->
                  <span class="text-h5 font-weight-bold primary--text">90%</span>
                  <span class="text-caption">为假</span>
                </div>
              </div>

              <!-- 任务列表
              <div class="task-list">
                <div class="d-flex flex-column">
                  <div class="task-item" v-for="i in 3" :key="i">
                    <div class="d-flex align-center">
                      <span class="text-h6 mr-3 font-weight-medium" style="min-width: 56px">任务{{ i }}</span>
                      <v-progress-linear
                        :model-value="70"
                        height="10"
                        class="flex-grow-1 rounded-lg"
                        color="primary"
                        rounded
                      ></v-progress-linear>
                    </div>
                  </div>
                </div>
              </div> -->

              <!-- 右侧任务信息 -->
              <div class="task-stats d-flex align-center">
                <div class="stat-item mr-4">
                  <div class="text-subtitle-1 d-flex justify-center">
                    <v-chip
                      variant="flat"
                      size="x-large"
                      class="unprocessed-chip font-weight-medium px-3"
                      style="min-width: 80px"
                    >
                      未处理
                    </v-chip>
                  </div>
                  <div class="text-h6 font-weight-bold">10份</div>
                </div>
                <div class="stat-item">
                  <div class="text-subtitle-1 d-flex justify-center">
                    <v-chip
                      variant="flat"
                      size="x-large"
                      class="sent-chip font-weight-medium px-3"
                      style="min-width: 80px"
                    >
                      已发送
                    </v-chip>
                  </div>
                  <div class="text-h6 font-weight-bold">3份</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <v-divider></v-divider>

      <!-- 主要内容区域 -->
      <div class="content-wrapper d-flex pa-2 justify-center">
        <div class="content-container d-flex" style="gap: 12px;">
          <!-- 图片列表 -->
          <div class="image-list rounded-lg elevation-1" style="background-color: rgb(var(--v-theme-surface)); padding: 20px;">
            <div class="text-h6 font-weight-medium text-center mb-4" style="white-space: nowrap;">图片列表</div>
            <div class="image-grid">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="image-grid-item"
                :class="{ 'active': currentImageIndex === index }"
                @click="handleImageSelect(index)"
              >
                <v-img
                  :src="image.thumbnail"
                  cover
                  width="100%"
                  height="100%"
                  class="rounded-lg"
                ></v-img>
              </div>
            </div>
          </div>

          <!-- 图片预览区域 -->
          <div class="preview-section">
            <div class="preview-box">
              <v-img
                v-if="currentImage"
                :src="currentImage.url"
                contain
                height="100%"
                class="rounded-lg"
              ></v-img>
              <span v-else class="text-h4">PIC</span>
              <div class="preview-controls">
                <v-btn 
                  icon="mdi-chevron-left" 
                  variant="flat"
                  @click="handlePrevImage"
                  :disabled="currentImageIndex <= 0"
                  class="control-btn"
                  color="black"
                  size="x-large"
                ></v-btn>
                <v-btn 
                  icon="mdi-chevron-right" 
                  variant="flat"
                  @click="handleNextImage"
                  :disabled="currentImageIndex >= images.length - 1"
                  class="control-btn"
                  color="black"
                  size="x-large"
                ></v-btn>
              </div>
            </div>
          </div>

          <!-- 右侧人工审核区域 -->
          <div class="review-section rounded-lg elevation-1">
            <div class="review-header">
              <div class="text-h6 font-weight-medium text-center">人工审核</div>
              <div class="reviewer-info mt-4">
                <div class="reviewer-item d-flex align-center mb-4">
                  <v-avatar size="32" class="mr-2">
                    <v-icon size="20">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-1">abc</div>
                    <div class="text-caption text-grey">结果：假</div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    variant="text"
                    density="compact"
                    class="details-btn"
                    color="primary"
                    @click="handleViewDetail"
                  >
                    查看详情
                    <v-icon size="16" class="ml-1">mdi-chevron-right</v-icon>
                  </v-btn>
                </div>
                <div class="reviewer-item d-flex align-center mb-4">
                  <v-avatar size="32" class="mr-2">
                    <v-icon size="20">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-1">abc</div>
                    <div class="text-caption text-grey">结果：假</div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    variant="text"
                    density="compact"
                    class="details-btn"
                    color="primary"
                    @click="handleViewDetail"
                  >
                    查看详情
                    <v-icon size="16" class="ml-1">mdi-chevron-right</v-icon>
                  </v-btn>
                </div>
                <div class="reviewer-item d-flex align-center">
                  <v-avatar size="32" class="mr-2">
                    <v-icon size="20">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-1">abc</div>
                    <div class="text-caption text-grey">结果：假</div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    variant="text"
                    density="compact"
                    class="details-btn"
                    color="primary"
                    @click="handleViewDetail"
                  >
                    查看详情
                    <v-icon size="16" class="ml-1">mdi-chevron-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加详情弹窗 -->
    <v-dialog
      v-model="showDetailDialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>检测详情</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <result-component 
          v-if="showDetailDialog"
          :task-id="taskData?.id"
          :imageUrl="images[currentImageIndex].url"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useSnackbarStore } from '@/stores/snackbar'
import ResultComponent from '@/components/result.vue'
import reviewer from '@/api/reviewer'

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const userStore = useUserStore()
const snackbar = useSnackbarStore()

interface Task {
  id: string
  publishTime: string
  reviewer: string
  progress: number
  publisherId: string
}

interface Image {
  id: string
  url: string
  thumbnail: string
  reviewStatus: string
  reviewComment?: string
}

// 定义路由参数的类型
interface RouteParams {
  id: string
}

const taskData = ref<Task | null>(null)
const images = ref<Image[]>([])
const currentImageIndex = ref(0)

const currentImage = computed(() => {
  return images.value[currentImageIndex.value]
})

const handleImageSelect = (index: number) => {
  currentImageIndex.value = index
}

const handlePrevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const handleNextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}

const checkTaskPermission = async () => {
  try {
    // 这里应该是从API获取任务数据
    // 模拟API调用
    const response = await new Promise<Task>((resolve) => {
      resolve({
        id: (route.params as RouteParams).id,
        publishTime: '2024-01-01 12:00:00',
        reviewer: '张三',
        progress: 90,
        publisherId: 'user123' // 这里应该是实际的发布者ID
      })
    })

    // 检查当前用户是否为任务发布者
    if (response.publisherId !== userStore.username) {
      snackbar.showMessage('您没有权限访问此任务', 'error')
      router.push('/history')
      return false
    }

    taskData.value = response
    return true
  } catch (error) {
    snackbar.showMessage('获取任务信息失败', 'error')
    router.push('/history')
    return false
  }
}

// 添加弹窗控制变量
const showDetailDialog = ref(false)

// 修改查看详情按钮的点击事件
const handleViewDetail = () => {
  showDetailDialog.value = true
}

onMounted(async () => {
  // 先检查权限
  //const hasPermission = await checkTaskPermission()
  const hasPermission = true
  if (!hasPermission) return

  // 模拟图片数据
  images.value = [
    {
      id: '1',
      url: 'https://picsum.photos/seed/img1/800/600',
      thumbnail: 'https://picsum.photos/seed/img1/80/80',
      reviewStatus: '未审核'
    },
    {
      id: '2',
      url: 'https://picsum.photos/seed/img2/800/600',
      thumbnail: 'https://picsum.photos/seed/img2/80/80',
      reviewStatus: '已审核'
    },
    {
      id: '3',
      url: 'https://picsum.photos/seed/img3/800/600',
      thumbnail: 'https://picsum.photos/seed/img3/80/80',
      reviewStatus: '未审核'
    },
    {
      id: '4',
      url: 'https://picsum.photos/seed/img4/800/600',
      thumbnail: 'https://picsum.photos/seed/img4/80/80',
      reviewStatus: '未审核'
    },
    {
      id: '5',
      url: 'https://picsum.photos/seed/img5/800/600',
      thumbnail: 'https://picsum.photos/seed/img5/80/80',
      reviewStatus: '已审核'
    },
    {
      id: '6',
      url: 'https://picsum.photos/seed/img6/800/600',
      thumbnail: 'https://picsum.photos/seed/img6/80/80',
      reviewStatus: '未审核'
    },
    {
      id: '7',
      url: 'https://picsum.photos/seed/img7/800/600',
      thumbnail: 'https://picsum.photos/seed/img7/80/80',
      reviewStatus: '已审核'
    },
    {
      id: '8',
      url: 'https://picsum.photos/seed/img8/800/600',
      thumbnail: 'https://picsum.photos/seed/img8/80/80',
      reviewStatus: '未审核'
    }
  ]
})
</script>

<style scoped>
.task-detail {
  position: relative;
  min-height: 100vh;
  max-height: 100vh;
  background-color: rgb(var(--v-theme-surface));
  overflow: hidden;
}

.main-content {
  height: calc(100vh - 80px);
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
}

.info-section {
  background-color: rgb(var(--v-theme-surface));
  padding: 16px 0;
}

.info-content {
  width: 100%;
  background-color: rgb(var(--v-theme-surface));
  min-height: 160px;
  padding: 12px 16px !important;
}

.progress-circle {
  width: clamp(100px, 8vw, 130px);
  height: clamp(100px, 8vw, 130px);
  border-radius: 50%;
  border: 5px solid rgb(var(--v-theme-primary));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--v-theme-surface));
}

.progress-circle .text-h5 {
  font-size: clamp(1.8rem, 2vw, 2.5rem) !important;
  line-height: 1.2;
}

.progress-circle .text-caption {
  font-size: 1rem !important;
  margin-top: 4px;
}

.task-list {
  width: clamp(360px, 30vw, 420px);
  padding: 0 12px;
}

.task-item {
  width: 100%;
  margin-bottom: 12px;
}

.task-item .v-progress-linear {
  width: clamp(260px, 25vw, 340px) !important;
  height: 10px !important;
}

.task-item .text-h6 {
  white-space: nowrap;
}

.image-list {
  width: clamp(100px, 8vw, 120px);
  height: calc(100vh - 380px);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.image-grid {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-top: -8px;
}

.image-grid-item {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s ease;
  border: 2px solid transparent;
  flex-shrink: 0;
}

.image-grid-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.image-grid-item.active {
  border-color: rgb(var(--v-theme-primary));
}

.content-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: min(1200px, 95vw);
  display: flex;
  justify-content: center;
}

.preview-section {
  flex: 1;
  min-width: 0;
  max-width: min(800px, 60vw);
  margin: 0 12px;
}

.preview-box {
  position: relative;
  height: calc(100vh - 380px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  overflow: hidden;
}

.preview-box .v-img {
  max-width: 800px;
  max-height: 100%;
  object-fit: contain;
}

.preview-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}

.control-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease !important;
}

.control-btn:hover {
  opacity: 1;
  transform: none;
}

.review-section {
  width: clamp(260px, 20vw, 300px);
  padding: 20px;
  background-color: rgb(var(--v-theme-surface));
  height: calc(100vh - 380px);
  overflow-y: auto;
  flex-shrink: 0;
  position: relative;
}

.review-header {
  margin-bottom: 16px;
}

.reviewer-item {
  position: relative;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.reviewer-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.details-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.reviewer-item:hover .details-btn {
  opacity: 1;
}

.unprocessed-chip {
  background-color: rgba(244, 67, 54, 0.1) !important;
  color: rgb(244, 67, 54) !important;
}

.sent-chip {
  background-color: rgba(76, 175, 80, 0.1) !important;
  color: rgb(76, 175, 80) !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.4);
}

.task-stats {
  min-width: 320px;
  justify-content: center;
}

.stat-item {
  min-width: 120px;
}

.stat-item .text-h6 {
  font-size: 1.8rem !important;
  text-align: center;
  margin-top: 8px;
}

@media (max-width: 1280px) {
  .task-stats {
    min-width: clamp(280px, 25vw, 320px);
  }
  
  .stat-item {
    min-width: clamp(100px, 10vw, 120px);
  }
  
  .stat-item .text-h6 {
    font-size: clamp(1.4rem, 1.5vw, 1.8rem) !important;
  }
}

@media (max-width: 960px) {
  .content-container {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .preview-section {
    max-width: 100%;
    order: -1;
  }

  .image-list, .review-section {
    height: auto;
    min-height: 300px;
  }
}

/* 添加弹窗过渡动画样式 */
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}

.dialog-bottom-transition-enter-from,
.dialog-bottom-transition-leave-to {
  transform: translateY(100%);
}
</style> 