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
              title="上传任务"
              :complete="currentStep > 1"
            ></v-stepper-item>

            <v-divider></v-divider>

            <v-stepper-item
              :value="2"
              title="选择图片"
              :complete="currentStep > 2"
            ></v-stepper-item>

            <v-divider></v-divider>

            <v-stepper-item
              :value="3"
              title="AI检测"
              :complete="currentStep > 3"
            ></v-stepper-item>

            <v-divider></v-divider>

            <v-stepper-item
              :value="4"
              title="发布审核"
              :complete="currentStep > 4"
            ></v-stepper-item>
          </v-stepper-header>

          <!-- 步骤内容 -->
          <v-stepper-window>
            <!-- 第一步：上传任务 -->
            <v-stepper-window-item :value="1">
              <TaskInfoStep @update="updateTaskInfo" />
            </v-stepper-window-item>

            <!-- 第二步：选择图片 -->
            <v-stepper-window-item :value="2">
              <ImageSelectionStep 
                :images="extractedImages"
                @update="updateSelectedImages"
              />
            </v-stepper-window-item>

            <!-- 第三步：AI检测 -->
            <v-stepper-window-item :value="3">
              <DetectionStep />
            </v-stepper-window-item>

            <!-- 第四步：生成结果 -->
            <v-stepper-window-item :value="4">
              <v-container class="mt-4">
                <v-row>
                  <v-col cols="12">
                    <div class="text-center">
                      <v-icon size="64" color="success">mdi-check-circle</v-icon>
                      <div class="text-h6 mt-4">检测完成</div>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
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
              {{ currentStep === 4 ? '完成' : '下一步' }}
            </v-btn>
          </v-card-actions>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TaskInfoStep from './steps/TaskInfoStep.vue'
import ImageSelectionStep from './steps/ImageSelectionStep.vue'
import DetectionStep from './steps/DetectionStep.vue'

interface TaskInfo {
  name: string
  description: string
  tags: string[]
}

const emit = defineEmits(['back', 'complete'])

const currentStep = ref(1)
const taskInfo = ref<TaskInfo>({
  name: '',
  description: '',
  tags: []
})

const extractedImages = ref([
  {
    url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    name: '图片1.jpg',
    size: '1.2MB',
    type: 'image/jpeg',
    selected: false
  },
  {
    url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    name: '图片2.jpg',
    size: '0.8MB',
    type: 'image/png',
    selected: false
  }
])

const selectedImages = ref<typeof extractedImages.value>([])

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return taskInfo.value.name && taskInfo.value.description
    case 2:
      return selectedImages.value.length > 0
    default:
      return true
  }
})

const updateTaskInfo = (info: typeof taskInfo.value) => {
  taskInfo.value = info
}

const updateSelectedImages = (images: typeof extractedImages.value) => {
  selectedImages.value = images
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  } else {
    emit('complete')
  }
}
</script>

<style scoped>
.v-stepper {
  box-shadow: none;
}
</style> 