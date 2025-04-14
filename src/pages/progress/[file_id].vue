<template>
  <div class="upload-progress ">
    <!-- 返回按钮 -->
    <div class="d-flex align-center mb-6">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        @click="router.push(`/upload`)" 
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ImageSelectionStep from '@/components/steps/ImageSelectionStep.vue'
import DetectionStep from '@/components/steps/DetectionStep.vue'
import ReviewStep from '@/components/steps/ReviewStep.vue'
import uploadApi from '@/api/upload'

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

const router = useRouter()
const route = useRoute<'/progress/[file_id]'>()

const currentStep = ref(1)
const extractedImages = ref<Image[]>([])
const selectedImages = ref<Image[]>([])

const reviewData = ref<ReviewData>({
  selectedFakeImages: [],
  selectedRealImages: [],
  selectedReviewers: []
})

// 简化 fileId 计算
const fileId = computed(() => String(route.params.file_id || ''))

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
      router.push(`/task/${route.params.file_id}`)
    }
  }
}

// 获取提取的图片
onMounted(async () => {
  try {
    const { data } = await uploadApi.getExtractedImages(route.params.file_id)
    extractedImages.value = data.images.map((img: any) => ({
      image_id: img.image_id,
      image_url: import.meta.env.VITE_API_URL + img.image_url,
      page_number: img.page_number,
      extracted_from_pdf: img.extracted_from_pdf,
      selected: false
    }))
    //console.log(extractedImages.value[0].image_url)
  } catch (error) {
    console.error('Failed to get extracted images:', error)
  }
})
</script>

<style scoped>
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