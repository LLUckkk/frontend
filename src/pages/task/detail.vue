<template>
  <div class="task-detail pa-4">
    <!-- 返回按钮 -->
    <div class="d-flex align-center mb-6">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        @click="router.back()" 
        class="mr-2 return-btn"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 font-weight-medium">返回我的任务</span>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content rounded-lg">
      <!-- 顶部信息区域 -->
      <div class="info-section pa-6">
        <div class="content-wrapper d-flex justify-center">
          <div class="content-container">
            <div class="info-content d-flex align-center justify-space-between pa-4">
              <!-- 左侧进度和标签 -->
              <div class="d-flex align-center" style="min-width: 320px">
                <div class="progress-circle mr-3 elevation-1">
                  <span class="text-h5 font-weight-bold primary--text">90%</span>
                  <span class="text-caption">为假</span>
                </div>
                <v-chip 
                  color="primary" 
                  variant="outlined" 
                  size="x-large" 
                  class="font-weight-medium px-3"
                  elevation="1"
                >
                  查看AI检测结果
                </v-chip>
              </div>

              <!-- 任务列表 -->
              <div class="task-list">
                <div class="d-flex flex-column">
                  <div class="task-item" v-for="i in 3" :key="i">
                    <div class="d-flex align-center">
                      <span class="text-h6 mr-3 font-weight-medium" style="min-width: 56px">任务{{ i }}</span>
                      <v-progress-linear
                        :model-value="taskProgress[i-1]"
                        height="10"
                        class="flex-grow-1 rounded-lg"
                        color="primary"
                        rounded
                      ></v-progress-linear>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧任务信息 -->
              <div class="task-stats d-flex align-center">
                <div class="stat-item mr-4">
                  <div class="text-subtitle-1 d-flex justify-center">
                    <v-chip
                      variant="flat"
                      size="x-large"
                      class="unprocessed-chip font-weight-medium px-3"
                      style="min-width: 80px"
                    >
                      未处理
                    </v-chip>
                  </div>
                  <div class="text-h6 font-weight-bold">30份</div>
                </div>
                <div class="stat-item">
                  <div class="text-subtitle-1 d-flex justify-center">
                    <v-chip
                      variant="flat"
                      size="x-large"
                      class="sent-chip font-weight-medium px-3"
                      style="min-width: 80px"
                    >
                      已发送
                    </v-chip>
                  </div>
                  <div class="text-h6 font-weight-bold">50份</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <v-divider></v-divider>

      <!-- 底部操作按钮 -->
      <div class="d-flex justify-end pa-4">
        <v-btn color="primary" class="mr-2">暂存</v-btn>
        <v-btn color="primary">提交</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const taskProgress = [70, 85, 30]
</script>

<style scoped>
.task-detail {
  position: relative;
  min-height: 100vh;
  max-height: 100vh;
  background-color: rgb(var(--v-theme-surface));
  overflow: hidden;
}

.main-content {
  height: calc(100vh - 80px);
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
}

.info-section {
  background-color: rgb(var(--v-theme-surface));
  padding: 16px 0;
}

.info-content {
  width: 100%;
  background-color: rgb(var(--v-theme-surface));
  min-height: 160px;
  padding: 12px 16px !important;
}

.progress-circle {
  width: clamp(100px, 8vw, 130px);
  height: clamp(100px, 8vw, 130px);
  border-radius: 50%;
  border: 5px solid rgb(var(--v-theme-primary));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--v-theme-surface));
}

.progress-circle .text-h5 {
  font-size: clamp(1.8rem, 2vw, 2.5rem) !important;
  line-height: 1.2;
}

.progress-circle .text-caption {
  font-size: 1rem !important;
  margin-top: 4px;
}

.task-list {
  width: clamp(360px, 30vw, 420px);
  padding: 0 12px;
}

.task-item {
  width: 100%;
  margin-bottom: 12px;
}

.task-item .v-progress-linear {
  width: clamp(260px, 25vw, 340px) !important;
  height: 10px !important;
}

.task-item .text-h6 {
  white-space: nowrap;
}

.content-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: min(1200px, 95vw);
  display: flex;
  justify-content: center;
}

.task-stats {
  min-width: 320px;
  justify-content: center;
}

.stat-item {
  min-width: 120px;
}

.stat-item .text-h6 {
  font-size: 1.8rem !important;
  text-align: center;
  margin-top: 8px;
}

.unprocessed-chip {
  background-color: rgba(244, 67, 54, 0.1) !important;
  color: rgb(244, 67, 54) !important;
}

.sent-chip {
  background-color: rgba(76, 175, 80, 0.1) !important;
  color: rgb(76, 175, 80) !important;
}

@media (max-width: 1280px) {
  .task-stats {
    min-width: clamp(280px, 25vw, 320px);
  }
  
  .stat-item {
    min-width: clamp(100px, 10vw, 120px);
  }
  
  .stat-item .text-h6 {
    font-size: clamp(1.4rem, 1.5vw, 1.8rem) !important;
  }
}
</style> 