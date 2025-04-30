<template>
  <v-card flat border="0">
    <v-card-text class="pa-0 mt-4">
      <v-stepper v-model="currentStep">
        <v-stepper-header>
          <v-stepper-item :value="1" title="AI检测" :complete="currentStep > 1"></v-stepper-item>

          <v-divider></v-divider>

          <v-stepper-item :value="2" title="发布审核" :complete="currentStep > 2"></v-stepper-item>
        </v-stepper-header>

        <!-- 步骤内容 -->
        <v-stepper-window>
          <!-- 第一步：AI检测 -->
          <v-stepper-window-item :value="1">
            <DetectionStep @complete="handleDetectionComplete" />
          </v-stepper-window-item>

          <!-- 第二步：发布审核 -->
          <v-stepper-window-item :value="2">
            <ReviewStep @update="handleReviewUpdate" />
          </v-stepper-window-item>
        </v-stepper-window>

        <!-- 底部按钮 -->
        <v-card-actions>
          <v-btn variant="text" @click="previousStep" v-if="currentStep !== 1">
            上一步
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="nextStep" :disabled="!canProceed">
            {{ currentStep === 2 ? '完成' : '下一步' }}
          </v-btn>
        </v-card-actions>
      </v-stepper>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
//注意鉴权！！！
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteParams } from 'vue-router'
import DetectionStep from '@/components/steps/DetectionStep.vue'
import ReviewStep from '@/components/steps/ReviewStep.vue'
import { useSnackbarStore } from '@/stores/snackbar';
import publisher from '@/api/publisher'
const snackbar = useSnackbarStore();

const router = useRouter()
const route = useRoute()

// 获取任务ID
const taskId = computed(() => (route.params as RouteParams & { id: string }).id)
// 步骤相关状态
const currentStep = ref(1)
const detectionComplete = ref(false)
const reviewData = ref({
  selectedFakeImages: [],
  selectedRealImages: [],
  selectedReviewers: []
})

// 组件挂载时获取任务数据
onMounted(async () => {
  currentStep.value = 1
  console.log('挂载成功')
  if (taskId.value) {
    // TODO: 根据taskId获取任务数据
    console.log('获取任务数据:', taskId.value)
  }
})

// 判断是否可以进入下一步
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return detectionComplete.value
    case 2:
      const { selectedFakeImages, selectedRealImages, selectedReviewers } = reviewData.value
      const hasSelectedImages = selectedFakeImages.length > 0 || selectedRealImages.length > 0
      return hasSelectedImages && selectedReviewers.length > 0
    default:
      return true
  }
})

// 处理检测完成
const handleDetectionComplete = () => {
  detectionComplete.value = true
}

// 处理审核更新
const handleReviewUpdate = (data: any) => {
  reviewData.value = data
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  } else {
    if (canProceed.value) {
      // TODO: 处理完成逻辑
      try {
        publisher.dispatchAnnual({ task_id: taskId, reviewers: reviewData.value.selectedReviewers })
        snackbar.showMessage('已提交人工复查任务，请等待管理员审核', 'success')
      } catch (error) {
        console.log(error)
        snackbar.showMessage('提交人工复查任务失败')
      }
      snackbar.showMessage('人工审核任务发布成功！', 'success')
      router.push('/history')
    }
  }
}
</script>

<style scoped>
.v-stepper {
  box-shadow: none;
}
</style>
