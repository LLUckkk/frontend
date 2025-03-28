<template>
  <v-container>
    <div v-if="!showProgress">
      <v-row>
        <v-col cols="12" lg="9">
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="h-100" :class="{ 'border border-primary': selectedVersion === 'free' }" @click="selectedVersion = 'free'">
                <v-card-title class="text-h6">免费版</v-card-title>
                <v-card-subtitle>0元/字</v-card-subtitle>
                <v-card-text>
                  <div class="text-body-2 mb-4">适用于初稿查重</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <div class="text-primary">数据库</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-primary">14个(近5年)</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持语言</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">中文</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>免费次数</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">每天1篇</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持AIGC检测</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="error">mdi-fire</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" :class="{ 'border border-primary': selectedVersion === 'pro' }" @click="selectedVersion = 'pro'">
                <v-card-title class="text-h6">专业版</v-card-title>
                <v-card-subtitle>3元/万字</v-card-subtitle>
                <v-card-text>
                  <div class="text-body-2 mb-4">适用于修改稿查重</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <div class="text-primary">数据库</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-primary">14个</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持语言</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">中文</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>极速检测</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="success">mdi-check</v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持AIGC检测</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="error">mdi-fire</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" :class="{ 'border border-primary': selectedVersion === 'premium' }" @click="selectedVersion = 'premium'">
                <v-card-title class="text-h6">至尊版</v-card-title>
                <v-card-subtitle>1.5元/千字</v-card-subtitle>
                <v-card-text>
                  <div class="text-body-2 mb-4">更按优高校的系统</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <div class="text-primary">数据库</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-primary">18个</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持语言</div>
                      </template>
                      <template v-slot:append>
                        <div class="text-warning">中英文</div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>极速检测</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="success">mdi-check</v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <div>支持AIGC检测</div>
                      </template>
                      <template v-slot:append>
                        <v-icon color="error">mdi-fire</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-6">
            <v-col cols="12">
              <v-card>
                <v-card-text class="text-center">
                  <div class="upload-area pa-8" @dragover.prevent @drop.prevent="handleDrop">
                    <v-icon size="64" color="grey">mdi-cloud-upload</v-icon>
                    <div class="text-h6 mt-4">点击或拖拽文件到此处上传</div>
                    <div class="text-caption text-grey">支持格式：压缩包文件大小不超过15M</div>
                    <input
                      type="file"
                      ref="fileInput"
                      style="display: none"
                      @change="handleFileSelect"
                    >
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end">
              <v-btn color="primary" size="large" :disabled="!selectedVersion" @click="handleSubmit">
                提交查重
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" lg="3">
          <v-card>
            <v-card-title class="d-flex align-center">
              全网班级动态
              <v-spacer></v-spacer>
              <v-btn icon="mdi-chevron-left" variant="text" density="compact"></v-btn>
              <v-btn icon="mdi-chevron-right" variant="text" density="compact"></v-btn>
            </v-card-title>
            <v-card-text>
              <v-timeline density="compact" align="start">
                <v-timeline-item
                  v-for="(item, index) in timelineItems"
                  :key="index"
                  dot-color="primary"
                  size="small"
                >
                  <div class="d-flex align-center">
                    <v-avatar size="32" class="mr-3">
                      <v-img :src="item.avatar" cover></v-img>
                    </v-avatar>
                    <div>
                      <div class="d-flex align-center">
                        <span class="text-body-2">{{ item.name }}</span>
                        <v-chip
                          size="x-small"
                          :color="item.tagColor"
                          class="ml-2"
                          label
                        >{{ item.tag }}</v-chip>
                      </div>
                      <div class="text-caption text-grey">
                        {{ item.count }}人查重 平均重复率: {{ item.rate }}
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <upload-progress
      v-else
      @back="showProgress = false"
      @next="handleProgressNext"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UploadProgress from '../components/UploadProgress.vue'

const showProgress = ref(false)
const selectedVersion = ref<'free' | 'pro' | 'premium' | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const timelineItems = ref([
  {
    name: 'hhhxcyf',
    avatar: '/avatars/default.png',
    tag: '黄金班',
    tagColor: 'warning',
    count: '10',
    rate: '14.6%'
  },
  {
    name: 'asdfsfff',
    avatar: '/avatars/default.png',
    tag: '星璨班',
    tagColor: 'error',
    count: '24',
    rate: '37.3%'
  },
  {
    name: '飞飞的小花猪',
    avatar: '/avatars/default.png',
    tag: '钻石班',
    tagColor: 'info',
    count: '21',
    rate: '8.8%'
  },
  {
    name: '写不好论文不...',
    avatar: '/avatars/default.png',
    tag: '星璨班',
    tagColor: 'error',
    count: '21',
    rate: '55.4%'
  }
])

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    // 处理文件上传
    console.log('Dropped files:', files)
  }
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    // 处理文件上传
    console.log('Selected files:', files)
  }
}

const handleSubmit = () => {
  showProgress.value = true
}

const handleProgressNext = (step: number) => {
  console.log('Progress step:', step)
  // 处理进度步骤
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.05);
}

.border {
  border-width: 2px !important;
  border-style: solid !important;
}

.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.v-timeline-item {
  margin-bottom: 16px;
}

.v-timeline-item:last-child {
  margin-bottom: 0;
}
</style> 