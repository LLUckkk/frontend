<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" @click="$emit('back')" class="mr-2"></v-btn>
          <span class="text-h6">返回</span>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ImageSelectionStep from './steps/ImageSelectionStep.vue'
import DetectionStep from './steps/DetectionStep.vue'
import ReviewStep from './steps/ReviewStep.vue'
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

const props = defineProps<{
  fileId: string
}>()

const emit = defineEmits(['back', 'complete'])

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
      emit('complete')
      emit('back')
    }
  }
}

// 获取提取的图片
onMounted(async () => {
  try {
    const { data } = await uploadApi.getExtractedImages(props.fileId)
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
.v-stepper {
  box-shadow: none;
}
</style> 