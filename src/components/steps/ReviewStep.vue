<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <!-- 疑似造假图片选择区域 -->
        <v-card class="mb-6" elevation="2" rounded="lg">
          <v-card-title class="d-flex justify-space-between pa-6">
            <div class="d-flex align-center">
              <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
              <span class="text-h6">疑似造假图片</span>
              <v-chip color="error" class="ml-4" size="small">{{ selectedFakeCount }}/{{ fakeImages.length }}</v-chip>
            </div>
            <v-btn color="error" variant="text" @click="selectAllFake">
              {{ isAllFakeSelected ? '取消全选' : '全选' }}
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-6">
            <v-sheet class="overflow-x-auto">
              <div class="d-flex image-grid">
                <v-hover v-for="(img, index) in fakeImages" :key="index" v-slot="{ isHovering, props }">
                  <v-card v-bind="props" class="ma-2 position-relative" width="200" height="200" elevation="2"
                    rounded="lg" @click="toggleImageSelection(img, 'fake')">
                    <v-img :src="getImageUrl(img.image_url)" cover height="100%">
                      <div class="image-overlay" v-if="isHovering || img.selected">
                        <div class="d-flex flex-column align-center gap-4">
                          <v-checkbox v-model="img.selected" color="primary" class="image-checkbox"></v-checkbox>
                          <v-btn icon="mdi-magnify" variant="text" color="white" size="large"
                            @click.stop="viewImageDetail(img)"></v-btn>
                        </div>
                      </div>
                    </v-img>
                  </v-card>
                </v-hover>
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>

        <!-- 正常图片选择区域 -->
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex justify-space-between pa-6">
            <div class="d-flex align-center">
              <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-h6">正常图片</span>
              <v-chip color="success" class="ml-4" size="small">{{ selectedRealCount }}/{{ realImages.length }}</v-chip>
            </div>
            <v-btn color="success" variant="text" @click="selectAllReal">
              {{ isAllRealSelected ? '取消全选' : '全选' }}
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-6">
            <v-sheet class="overflow-x-auto">
              <div class="d-flex image-grid">
                <v-hover v-for="(img, index) in realImages" :key="index" v-slot="{ isHovering, props }">
                  <v-card v-bind="props" class="ma-2 position-relative" width="200" height="200" elevation="2"
                    rounded="lg" @click="toggleImageSelection(img, 'real')">
                    <v-img :src="getImageUrl(img.image_url)" cover height="100%">
                      <div class="image-overlay" v-if="isHovering || img.selected">
                        <div class="d-flex flex-column align-center gap-4">
                          <v-checkbox v-model="img.selected" color="primary" class="image-checkbox"></v-checkbox>
                          <v-btn icon="mdi-magnify" variant="text" color="white" size="large"
                            @click.stop="viewImageDetail(img)"></v-btn>
                        </div>
                      </div>
                    </v-img>
                  </v-card>
                </v-hover>
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>

        <!-- 已选择人员区域 -->
        <v-card class="mt-6" elevation="2" rounded="lg">
          <v-card-title class="pa-6">
            <span class="text-h6">已选择审核人员</span>
            <v-chip class="ml-4" size="small">{{ selectedPeople }}</v-chip>
          </v-card-title>
          <v-card-text class="pa-6">
            <v-autocomplete v-model="selectedPeopleList" :items="filteredPeople" :loading="isSearching"
              :search-input.sync="searchQuery" item-title="name" item-value="id" label="搜索审核人员" multiple chips
              closable-chips hide-details variant="outlined" @update:search="searchPeople">
              <template v-slot:chip="{ props, item }">
                <v-chip v-bind="props" :prepend-avatar="getAvatar(item.raw.avatar)">
                  {{ item.raw.username }}
                </v-chip>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :prepend-avatar="getAvatar(item.raw.avatar)"
                  :title="item.raw.username"></v-list-item>
              </template>
            </v-autocomplete>
          </v-card-text>
        </v-card>
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
          <v-img :src="getSelectedImageUrl(selectedImage)" max-height="500" contain class="rounded-lg"></v-img>
          <div class="mt-6">
            <div class="d-flex flex-column gap-2">
              <div class="info-item d-flex align-center">
                <v-icon color="grey" class="mr-2">mdi-check-circle</v-icon>
                <span class="text-body-1">检测结果：{{ selectedImage?.isFake ? '疑似造假' : '正常' }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import publisher from '@/api/publisher'
import { useSnackbarStore } from '@/stores/snackbar'

interface Image {
  image_id: string
  result_id: string
  image_url: string
  selected: boolean
  isFake?: boolean
}

interface Person {
  id: number
  username: string
  avatar: string
}

const emit = defineEmits(['update'])
const snackbar = useSnackbarStore()

const props = withDefaults(defineProps<{
  task_id?: string
}>(), {
  task_id: ''
})

// 模拟图片数据
const fakeImages = ref<Image[]>([])
const realImages = ref<Image[]>([])
// 搜索和已选择人员
const searchQuery = ref('')
const isSearching = ref(false)
const allPeople = ref<Person[]>([])

onMounted(async () => {
  // 从本地存储加载主题设置
  try {
    allPeople.value = (await publisher.getAllReviewers()).data
    fakeImages.value = (await publisher.getFakeImage({ task_id: props.task_id, include_image: 1 })).data.results
    realImages.value = (await publisher.getNormalImage({ task_id: props.task_id, include_image: 1 })).data.results
  } catch (error) {
    snackbar.showMessage('获取审核人员失败', 'error')
  }
})

const getImageUrl = (url: string) => {
  return import.meta.env.VITE_API_URL + url
}

const getSelectedImageUrl = (selectedImage: Image | null) => {
  if (selectedImage) {
    console.log(import.meta.env.VITE_API_URL + selectedImage.image_url)
    return import.meta.env.VITE_API_URL + selectedImage.image_url
  } else {
    console.log('no selected')
    return ''
  }
}

const getAvatar = (url: string) => {
  return import.meta.env.VITE_API_URL + url
}

const selectedPeopleList = ref<Person[]>([])

// 图片详情
const showImageDetail = ref(false)
const selectedImage = ref<Image | null>(null)

// 计算属性
const selectedFakeCount = computed(() => fakeImages.value.filter(img => img.selected).length)
const selectedRealCount = computed(() => realImages.value.filter(img => img.selected).length)

const reviewImages = computed(() => [
  ...fakeImages.value.filter((img: Image) => img.selected).map((img: Image) => img.image_id),
  ...realImages.value.filter((img: Image) => img.selected).map((img: Image) => img.image_id)
]);

const selectedPeople = computed(() => selectedPeopleList.value.length)
const isAllFakeSelected = computed(() => fakeImages.value.every(img => img.selected))
const isAllRealSelected = computed(() => realImages.value.every(img => img.selected))

const filteredPeople = computed(() => {
  if (!searchQuery.value) return allPeople.value
  const query = searchQuery.value.toLowerCase()
  return allPeople.value.filter(person =>
    person.username.toLowerCase().includes(query)
  )
})

// 方法
const toggleImageSelection = (img: Image, type: 'fake' | 'real') => {
  img.selected = !img.selected
  emitUpdate()
}

const selectAllFake = () => {
  const newValue = !isAllFakeSelected.value
  fakeImages.value.forEach(img => img.selected = newValue)
  emitUpdate()
}

const selectAllReal = () => {
  const newValue = !isAllRealSelected.value
  realImages.value.forEach(img => img.selected = newValue)
  emitUpdate()
}

const viewImageDetail = (img: Image) => {
  selectedImage.value = img
  showImageDetail.value = true
}

const searchPeople = async (query: string) => {
  // 模拟搜索延迟
  isSearching.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  isSearching.value = false
}

const emitUpdate = () => {
  emit('update', {
    reviewImages,
    selectedReviewers: selectedPeopleList.value
  })
}

// 监听选择变化
watch([selectedPeopleList], () => {
  emitUpdate()
})
</script>

<style scoped>
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

.image-checkbox {
  margin: 0;
  padding: 0;
}

.selected-people-container {
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 8px;
}

.gap-4 {
  gap: 1rem;
}
</style>