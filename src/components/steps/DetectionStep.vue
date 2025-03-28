<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <div class="detection-summary text-center mb-8">
          <v-progress-circular
            :model-value="(detectionResult.fakeCount / detectionResult.totalCount) * 100"
            :size="150"
            :width="15"
            color="primary"
          >
            <div class="text-h4">{{ detectionResult.fakeCount }}/{{ detectionResult.totalCount }}</div>
          </v-progress-circular>
          <div class="text-h6 mt-4">造假图片数量</div>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title class="text-h6">
                疑似造假图片
                <v-chip class="ml-2" color="error" size="small">{{ detectionResult.fakeImages.length }}</v-chip>
              </v-card-title>
              <v-card-text>
                <div class="d-flex flex-wrap gap-2">
                  <v-img
                    v-for="(img, index) in detectionResult.fakeImages"
                    :key="index"
                    :src="img.url"
                    width="150"
                    height="100"
                    cover
                    class="rounded"
                    @click="viewImageDetail(img)"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                    <div class="image-overlay d-flex align-center justify-center">
                      <v-btn icon="mdi-magnify" variant="text" color="white" @click.stop="viewImageDetail(img)"></v-btn>
                    </div>
                  </v-img>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="text-h6">
                正常图片
                <v-chip class="ml-2" color="success" size="small">{{ detectionResult.realImages.length }}</v-chip>
              </v-card-title>
              <v-card-text>
                <div class="d-flex flex-wrap gap-2">
                  <v-img
                    v-for="(img, index) in detectionResult.realImages"
                    :key="index"
                    :src="img.url"
                    width="150"
                    height="100"
                    cover
                    class="rounded"
                    @click="viewImageDetail(img)"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                    <div class="image-overlay d-flex align-center justify-center">
                      <v-btn icon="mdi-magnify" variant="text" color="white" @click.stop="viewImageDetail(img)"></v-btn>
                    </div>
                  </v-img>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 图片详情对话框 -->
    <v-dialog v-model="showImageDetail" max-width="800">
      <v-card>
        <v-card-title>图片详情</v-card-title>
        <v-card-text>
          <v-img
            :src="selectedImage?.url"
            max-height="500"
            contain
          ></v-img>
          <div class="mt-4">
            <div class="text-h6">{{ selectedImage?.name }}</div>
            <div class="text-body-2">检测时间：{{ detectionResult.detectionTime }}</div>
            <div class="text-body-2">检测编号：{{ detectionResult.detectionId }}</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showImageDetail = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
</script>

<style scoped>
.detection-summary {
  position: relative;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.v-img:hover .image-overlay {
  opacity: 1;
}

.gap-2 {
  gap: 8px;
}
</style> 