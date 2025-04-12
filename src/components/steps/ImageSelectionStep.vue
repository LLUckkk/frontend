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
    </v-row>

    <v-row class="h-100">
      <!-- 左侧缩略图列表 -->
      <v-col cols="4" class="thumbnail-list pa-0">
        <v-card class="h-100">
          <v-card-text class="pa-0 h-100">
            <v-list lines="two" class="thumbnail-scroll h-100">
              <v-list-item
                v-for="(image, index) in displayImages"
                :key="image.image_id"
                :class="{ 'selected-item': image.selected }"
                @click="selectImage(image)"
              >
                <template v-slot:prepend>
                  <v-avatar size="60" class="me-2">
                    <v-img
                      :src="image.image_url"
                      cover
                      class="bg-grey-lighten-2"
                    ></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title>
                  {{ image.extracted_from_pdf ? `第 ${image.page_number} 页` : `图片 ${image.image_id}` }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ image.extracted_from_pdf ? 'PDF提取' : '图片文件' }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-checkbox
                    v-model="image.selected"
                    hide-details
                    density="compact"
                    @click.stop
                    @update:model-value="emitUpdate"
                  ></v-checkbox>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右侧大图预览 -->
      <v-col cols="8" class="preview-section pa-0">
        <v-card class="h-100">
          <v-card-text class="pa-0 preview-wrapper h-100">
            <div v-if="selectedImage" class="preview-container h-100">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                size="x-large"
                class="preview-nav-btn preview-nav-left"
                :disabled="!canNavigatePrev"
                @click="navigatePrev"
              ></v-btn>
              
              <div class="image-container">
                <v-img
                  :src="selectedImage.image_url"
                  class="preview-image"
                  cover
                ></v-img>
              </div>
              
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                size="x-large"
                class="preview-nav-btn preview-nav-right"
                :disabled="!canNavigateNext"
                @click="navigateNext"
              ></v-btn>

              <div class="preview-info pa-4">
                <div class="text-h6">
                  {{ selectedImage.extracted_from_pdf ? `第 ${selectedImage.page_number} 页` : `图片 ${selectedImage.image_id}` }}
                </div>
                <div class="text-body-2">
                  {{ selectedImage.extracted_from_pdf ? '从PDF提取' : '图片文件' }}
                </div>
              </div>
            </div>
            <div v-else class="d-flex align-center justify-center h-100">
              <div class="text-h6 text-grey">请选择一张图片查看详情</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Image {
  image_id: number
  image_url: string
  page_number?: number
  extracted_from_pdf: boolean
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

// 添加示例图片数据
const sampleImages = ref<Image[]>([
  {
    image_id: 1,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 2,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 3,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 4,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 5,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 6,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 7,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 8,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 9,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  },
  {
    image_id: 10,
    image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
    extracted_from_pdf: false,
    selected: false
  }
])

// 使用计算属性合并props和示例图片
const displayImages = computed(() => {
  return props.images.length > 0 ? props.images : sampleImages.value
})

// 添加滚动加载相关变量
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 添加滚动加载方法
const loadMoreImages = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    // 模拟加载更多图片
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newImages = Array(5).fill(null).map((_, index) => ({
      image_id: page.value * 5 + index + 1,
      image_url: 'https://seafoodfat1ger.github.io/img/toux.jpg',
      extracted_from_pdf: false,
      selected: false
    }))
    
    sampleImages.value.push(...newImages)
    page.value++
    
    // 模拟数据加载完毕
    if (page.value >= 4) {
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

// 监听滚动事件
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
    loadMoreImages()
  }
}

// 组件挂载时添加滚动监听
onMounted(() => {
  const thumbnailList = document.querySelector('.thumbnail-scroll')
  if (thumbnailList) {
    thumbnailList.addEventListener('scroll', handleScroll)
  }
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  const thumbnailList = document.querySelector('.thumbnail-scroll')
  if (thumbnailList) {
    thumbnailList.removeEventListener('scroll', handleScroll)
  }
})

const selectedImage = ref<Image | null>(null)
const currentIndex = ref(-1)

const selectImage = (image: Image) => {
  selectedImage.value = image
  currentIndex.value = displayImages.value.findIndex(img => img.image_id === image.image_id)
}

const canNavigatePrev = computed(() => currentIndex.value > 0)
const canNavigateNext = computed(() => currentIndex.value < displayImages.value.length - 1)

const navigatePrev = () => {
  if (canNavigatePrev.value) {
    currentIndex.value--
    selectedImage.value = displayImages.value[currentIndex.value]
  }
}

const navigateNext = () => {
  if (canNavigateNext.value) {
    currentIndex.value++
    selectedImage.value = displayImages.value[currentIndex.value]
  }
}

const selectAllImages = () => {
  const allSelected = displayImages.value.every(img => img.selected)
  displayImages.value.forEach(img => {
    img.selected = !allSelected
  })
  emitUpdate()
}

const emitUpdate = () => {
  emit('update', displayImages.value.filter(img => img.selected))
}
</script>

<style scoped>
.thumbnail-list {
  height: calc(100vh - 300px);
  overflow: hidden;
}

.preview-section {
  height: calc(100vh - 300px);
  overflow: hidden;
}

.thumbnail-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.v-list {
  padding: 0;
}

.v-list-item {
  min-height: 80px;
  padding: 8px 16px;
}

.selected-item {
  background-color: rgb(var(--v-theme-primary), 0.1);
}

.preview-wrapper {
  position: relative;
  height: 100%;
}

.preview-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
}

.preview-image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.preview-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  background: rgba(0, 0, 0, 0.3) !important;
  color: white !important;
}

.preview-nav-btn:hover {
  background: rgba(0, 0, 0, 0.5) !important;
}

.preview-nav-left {
  left: 16px;
}

.preview-nav-right {
  right: 16px;
}

.preview-info {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
}
</style> 