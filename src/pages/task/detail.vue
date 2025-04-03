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
      <span class="text-h6 font-weight-medium">返回我的任务</span>
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
                  <span class="text-h5 font-weight-bold primary--text">90%</span>
                  <span class="text-caption">为假</span>
                </div>
                <v-chip 
                  color="primary" 
                  variant="outlined" 
                  size="x-large" 
                  class="font-weight-medium px-3"
                  elevation="1"
                >
                  查看AI检测结果
                </v-chip>
              </div>

              <!-- 任务列表 -->
              <div class="task-list">
                <div class="d-flex flex-column">
                  <div class="task-item" v-for="i in 3" :key="i">
                    <div class="d-flex align-center">
                      <span class="text-h6 mr-3 font-weight-medium" style="min-width: 56px">任务{{ i }}</span>
                      <v-progress-linear
                        :model-value="taskProgress[i-1]"
                        height="10"
                        class="flex-grow-1 rounded-lg"
                        color="primary"
                        rounded
                      ></v-progress-linear>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧任务信息 -->
              <div class="task-stats d-flex align-center">
                <div class="answer-card">
                  <div class="text-h6 font-weight-medium mb-4">答题卡</div>
                  <div class="answer-grid">
                    <v-btn
                      v-for="(image, index) in images"
                      :key="index"
                      :color="getAnswerButtonColor(index)"
                      variant="outlined"
                      size="small"
                      class="answer-btn"
                      density="compact"
                      @click="handleImageSelect(index)"
                    >
                      {{ index + 1 }}
                    </v-btn>
                  </div>
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

          <!-- 评分维度区域 -->
          <div class="dimension-section rounded-lg elevation-1">
            <div class="text-h6 font-weight-medium mb-4">评分维度</div>
            <div class="dimension-list">
              <div 
                v-for="(dimension, index) in dimensions" 
                :key="index"
                class="dimension-item mb-6"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-subtitle-1">{{ dimension.name }}</span>
                  <span class="text-body-2">{{ dimension.value }}%</span>
                </div>
                <v-slider
                  v-model="dimension.value"
                  :color="dimension.value > 60 ? 'success' : dimension.value > 30 ? 'warning' : 'error'"
                  :min="0"
                  :max="100"
                  :step="1"
                  class="mb-2"
                  thumb-label
                ></v-slider>
                <v-text-field
                  v-model="dimension.reason"
                  :label="'请输入' + dimension.name + '的理由'"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mt-2"
                ></v-text-field>
              </div>

              <!-- 造假判定按钮组 -->
              <div class="fake-judge-section mt-4 pt-4">
                <div class="text-subtitle-1 mb-4">造假判定</div>
                <div class="d-flex justify-space-between">
                  <v-btn
                    :color="imageJudgements[currentImageIndex] === true ? 'error' : 'grey-lighten-1'"
                    variant="tonal"
                    class="flex-grow-1 mr-2"
                    @click="handleJudgement(true)"
                  >
                    造假图片
                  </v-btn>
                  <v-btn
                    :color="imageJudgements[currentImageIndex] === false ? 'success' : 'grey-lighten-1'"
                    variant="tonal"
                    class="flex-grow-1"
                    @click="handleJudgement(false)"
                  >
                    真实图片
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="d-flex justify-end pa-4">
        <v-btn color="primary" class="mr-2">暂存</v-btn>
        <v-btn color="primary">提交</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const taskProgress = [70, 85, 30]

// 图片相关数据和方法
const currentImageIndex = ref(0)
const images = ref([
  {
    id: '1',
    url: 'https://picsum.photos/id/237/800/600',
    thumbnail: 'https://picsum.photos/id/237/80/80',
  },
  {
    id: '2',
    url: 'https://picsum.photos/id/238/800/600',
    thumbnail: 'https://picsum.photos/id/238/80/80',
  },
  {
    id: '3',
    url: 'https://picsum.photos/id/239/800/600',
    thumbnail: 'https://picsum.photos/id/239/80/80',
  }
])

const currentImage = computed(() => images.value[currentImageIndex.value])

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

const getAnswerColor = (index: number) => {
  // 这里可以根据实际答题状态返回不同的颜色
  if (index <= 5) return 'success' // 已完成的题目
  if (index === 6) return 'primary' // 当前题目
  return 'grey' // 未完成的题目
}

// 评分维度数据
const dimensions = ref([
  {
    name: '真实性',
    value: 80,
    reason: ''
  },
  {
    name: '可信度',
    value: 60,
    reason: ''
  },
  {
    name: '时效性',
    value: 90,
    reason: ''
  },
  {
    name: '关联度',
    value: 70,
    reason: ''
  }
])

// 图片造假判定数据
const imageJudgements = ref<(boolean | null)[]>(new Array(images.value.length).fill(null))

// 处理造假判定
const handleJudgement = (isFake: boolean) => {
  imageJudgements.value[currentImageIndex.value] = isFake
}

// 获取答题卡按钮颜色
const getAnswerButtonColor = (index: number) => {
  if (index === currentImageIndex.value) return 'primary'
  const judgement = imageJudgements.value[index]
  if (judgement === null) return 'grey'
  return judgement ? 'error' : 'success'
}
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

.task-stats {
  min-width: 320px;
  justify-content: center;
}

.answer-card {
  padding: 16px;
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.answer-btn {
  width: 36px !important;
  min-width: 0 !important;
  height: 36px !important;
  padding: 0 !important;
}

@media (max-width: 1280px) {
  .task-stats {
    min-width: clamp(280px, 25vw, 320px);
  }
  
  .answer-card {
    padding: 12px;
  }
  
  .answer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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

@media (max-width: 960px) {
  .content-container {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .preview-section {
    max-width: 100%;
    order: -1;
  }

  .image-list {
    height: auto;
    min-height: 300px;
  }

  .answer-card {
    padding: 12px;
  }
  
  .answer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dimension-section {
  width: 300px;
  padding: 20px;
  background-color: rgb(var(--v-theme-surface));
  height: calc(100vh - 380px);
  overflow-y: auto;
}

.dimension-list {
  padding-right: 12px;
}

.dimension-item {
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
  padding-bottom: 16px;
}

.dimension-item:last-child {
  border-bottom: none;
}

@media (max-width: 1280px) {
  .dimension-section {
    width: 260px;
  }
}

.fake-judge-section {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
}
</style> 