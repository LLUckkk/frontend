<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <span class="text-h6">已提取图片</span>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-check-all"
            @click="selectAllImages"
          >
            全选
          </v-btn>
        </div>
      </v-col>

      <v-col
        v-for="(image, index) in images"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card>
          <v-img
            :src="image.url"
            height="200"
            cover
            class="bg-grey-lighten-2"
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="grey-lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card-text class="pa-2">
            <v-checkbox
              v-model="image.selected"
              :label="image.name"
              hide-details
              density="compact"
              @update:model-value="emitUpdate"
            ></v-checkbox>
          </v-card-text>

          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              block
              @click="viewImageDetail(image)"
            >
              查看详细
            </v-btn>
          </v-card-actions>
        </v-card>
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
            <div class="text-body-2">大小：{{ selectedImage?.size }}</div>
            <div class="text-body-2">类型：{{ selectedImage?.type }}</div>
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
  size: string
  type: string
  selected: boolean
}

const props = withDefaults(defineProps<{
  images?: Image[]
}>(), {
  images: () => []
})

const emit = defineEmits<{
  (e: 'update', selectedImages: Image[]): void
}>()

const showImageDetail = ref(false)
const selectedImage = ref<Image | null>(null)

const selectAllImages = () => {
  const allSelected = props.images.every(img => img.selected)
  props.images.forEach(img => {
    img.selected = !allSelected
  })
  emitUpdate()
}

const viewImageDetail = (image: Image) => {
  selectedImage.value = image
  showImageDetail.value = true
}

const emitUpdate = () => {
  emit('update', props.images.filter(img => img.selected))
}
</script> 