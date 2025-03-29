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
                <v-progress-circular
                  :model-value="(detectionResult.fakeCount / detectionResult.totalCount) * 100"
                  :size="160"
                  :width="12"
                  color="primary"
                  class="custom-progress"
                >
                  <div class="progress-content">
                    <div class="text-h4 font-weight-bold responsive-text">{{ detectionResult.fakeCount }}/{{ detectionResult.totalCount }}</div>
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
                      <v-icon :color="isDarkMode ? 'grey-lighten-1' : 'grey-darken-2'" class="mr-2">mdi-clock-outline</v-icon>
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
                  <v-btn
                    color="primary"
                    variant="elevated"
                    class="px-8 py-2"
                    rounded="pill"
                    prepend-icon="mdi-file-document-outline"
                    elevation="2"
                  >
                    查看报告
                  </v-btn>
                  <v-btn
                    color="grey-lighten-5"
                    variant="elevated"
                    class="px-8 py-2"
                    rounded="pill"
                    prepend-icon="mdi-download-outline"
                    elevation="2"
                  >
                    批量下载
                  </v-btn>
                  <v-btn
                    :color="isDarkMode ? 'green-darken-2' : 'success'"
                    variant="elevated"
                    class="px-8 py-2"
                    rounded="pill"
                    prepend-icon="mdi-check-circle"
                    elevation="2"
                    @click="completeDetection"
                  >
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
                  <v-chip color="error" class="ml-4" size="small">{{ detectionResult.fakeImages.length }}</v-chip>
                </div>
              </v-card-title>
              <v-card-text class="pa-6">
                <v-sheet class="overflow-x-auto">
                  <div class="d-flex image-grid">
                    <v-hover v-for="(img, index) in detectionResult.fakeImages" :key="index" v-slot="{ isHovering, props }">
                      <v-card
                        v-bind="props"
                        class="ma-2"
                        width="200"
                        height="200"
                        elevation="2"
                        rounded="lg"
                      >
                        <v-img
                          :src="img.url"
                          cover
                          height="100%"
                        >
                          <div class="image-overlay" v-if="isHovering">
                            <div class="d-flex flex-column align-center">
                              <v-btn
                                icon="mdi-magnify"
                                variant="text"
                                color="white"
                                size="large"
                                @click.stop="viewImageDetail(img)"
                              ></v-btn>
                              <div class="text-caption white--text mt-2">查看详情</div>
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
                  <v-chip color="success" class="ml-4" size="small">{{ detectionResult.realImages.length }}</v-chip>
                </div>
              </v-card-title>
              <v-card-text class="pa-6">
                <v-sheet class="overflow-x-auto">
                  <div class="d-flex image-grid">
                    <v-hover v-for="(img, index) in detectionResult.realImages" :key="index" v-slot="{ isHovering, props }">
                      <v-card
                        v-bind="props"
                        class="ma-2"
                        width="200"
                        height="200"
                        elevation="2"
                        rounded="lg"
                      >
                        <v-img
                          :src="img.url"
                          cover
                          height="100%"
                        >
                          <div class="image-overlay" v-if="isHovering">
                            <div class="d-flex flex-column align-center">
                              <v-btn
                                icon="mdi-magnify"
                                variant="text"
                                color="white"
                                size="large"
                                @click.stop="viewImageDetail(img)"
                              ></v-btn>
                              <div class="text-caption white--text mt-2">查看详情</div>
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
    <v-dialog v-model="showImageDetail" max-width="800">
      <v-card rounded="lg">
        <v-card-title class="pa-6">
          <span class="text-h6">图片详情</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showImageDetail = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-img
            :src="selectedImage?.url"
            max-height="500"
            contain
            class="rounded-lg"
          ></v-img>
          <div class="mt-6">
            <div class="text-h6 mb-4">{{ selectedImage?.name }}</div>
            <div class="d-flex flex-column gap-2">
              <div class="info-item d-flex align-center">
                <v-icon color="grey" class="mr-2">mdi-clock-outline</v-icon>
                <span class="text-body-1">检测时间：{{ detectionResult.detectionTime }}</span>
              </div>
              <div class="info-item d-flex align-center">
                <v-icon color="grey" class="mr-2">mdi-pound</v-icon>
                <span class="text-body-1">检测编号：{{ detectionResult.detectionId }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'

interface Image {
  url: string
  name: string
  type: string
}

interface DetectionResult {
  detectionTime: string
  detectionId: string
  totalCount: number
  fakeCount: number
  fakeImages: Image[]
  realImages: Image[]
}

const theme = useTheme()
const router = useRouter()
const emit = defineEmits(['complete'])
const isDarkMode = computed(() => theme.global.current.value.dark)

// 模拟检测结果数据
const detectionResult = ref<DetectionResult>({
  detectionTime: '2025.1.28',
  detectionId: 'abcdefg',
  totalCount: 25,
  fakeCount: 20,
  fakeImages: [
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '造假图片2.jpg',
      type: 'image/jpeg',
    }
  ],
  realImages: [
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '真实图片1.jpg',
      type: 'image/jpeg',
    },
    {
      url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      name: '真实图片2.jpg',
      type: 'image/jpeg',
    }
  ]
})

const showImageDetail = ref(false)
const selectedImage = ref<Image | null>(null)

const viewImageDetail = (image: Image) => {
  selectedImage.value = image
  showImageDetail.value = true
}

const completeDetection = () => {
  // 触发完成事件
  emit('complete')
}
</script>

<style scoped>
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