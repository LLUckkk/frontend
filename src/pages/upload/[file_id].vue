<template>
  <div class="upload-progress">
    <!-- 顶部导航栏 -->
    <v-app-bar flat class="bg-surface">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        @click="handleBack" 
        class="mr-2"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-app-bar-title class="text-h6 font-weight-medium">上传进度</v-app-bar-title>
    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-container class="pa-4">
      <v-stepper v-model="currentStep" class="elevation-0">
        <!-- 步骤指示器 -->
        <v-stepper-header class="elevation-0">
          <v-stepper-item
            :value="1"
            title="选择图片"
            :complete="currentStep > 1"
            class="text-subtitle-1"
          ></v-stepper-item>

          <v-divider></v-divider>

          <v-stepper-item
            :value="2"
            title="AI检测"
            :complete="currentStep > 2"
            class="text-subtitle-1"
          ></v-stepper-item>

          <v-divider></v-divider>

          <v-stepper-item
            :value="3"
            title="发布审核"
            :complete="currentStep > 3"
            class="text-subtitle-1"
          ></v-stepper-item>
        </v-stepper-header>

        <!-- 步骤内容 -->
        <v-stepper-window>
          <!-- 第一步：选择图片 -->
          <v-stepper-window-item :value="1">
            <ImageSelectionStep 
              :images="extractedImages"
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
        <v-card-actions class="px-4 py-3 bg-surface">
          <v-btn
            variant="text"
            @click="previousStep"
            :disabled="currentStep === 1"
            class="text-body-1"
          >
            上一步
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="nextStep"
            :disabled="!canProceed"
            class="text-body-1"
          >
            {{ currentStep === 3 ? '完成' : '下一步' }}
          </v-btn>
        </v-card-actions>
      </v-stepper>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ImageSelectionStep from '@/components/steps/ImageSelectionStep.vue'
import DetectionStep from '@/components/steps/DetectionStep.vue'
import ReviewStep from '@/components/steps/ReviewStep.vue'
import uploadApi from '@/api/upload'

interface Image {
  url: string
  name: string
  size: string
  type: string
  selected: boolean
}

interface ReviewData {
  selectedFakeImages: any[]
  selectedRealImages: any[]
  selectedReviewers: any[]
}

// 定义路由参数的类型
interface RouteParams {
  file_id: string
}

const router = useRouter()
const route = useRoute()

const currentStep = ref(1)
const extractedImages = ref<Image[]>([])
const selectedImages = ref<Image[]>([])

const reviewData = ref<ReviewData>({
  selectedFakeImages: [],
  selectedRealImages: [],
  selectedReviewers: []
})

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
      router.push(`/task/${(route.params as RouteParams).file_id}`)
    }
  }
}

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.back()
  }
}

// 获取提取的图片
onMounted(async () => {
  try {
    const { data } = await uploadApi.getExtractedImages((route.params as RouteParams).file_id)
    extractedImages.value = data.images.map((img: any) => ({
      url: img.url,
      name: img.name,
      size: img.size,
      type: img.type,
      selected: false
    }))
  } catch (error) {
    console.error('Failed to get extracted images:', error)
  }
})
</script>

<style scoped>
.upload-progress {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-surface));
}

.v-stepper {
  background-color: transparent;
}

.v-stepper-header {
  background-color: transparent;
}

.v-stepper-window {
  background-color: transparent;
}

.v-card-actions {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style> 