<template>
  <div class="statistics-container">
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-title class="text-h6">总任务数</v-card-title>
          <v-card-text class="text-center">
            <div class="number">{{ totalTasks }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-title class="text-h6">已完成任务数</v-card-title>
          <v-card-text class="text-center">
            <div class="number">{{ completedTasks }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-title class="text-h6">待处理任务数</v-card-title>
          <v-card-text class="text-center">
            <div class="number">{{ pendingTasks }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-title class="text-h6">进行中任务数</v-card-title>
          <v-card-text class="text-center">
            <div class="number">{{ inProgressTasks }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar';
import analytics from "@/api/analytics"
const snackbar = useSnackbarStore();

const totalTasks = ref(0)
const completedTasks = ref(0)
const pendingTasks = ref(0)
const inProgressTasks = ref(0)

const fetchStatistics = async () => {
  try {
    const response = await analytics.getTaskData()
    if (response && response.data) {
      totalTasks.value = response.data.task_stats.total_tasks || 0
      completedTasks.value = response.data.task_stats.completed_tasks || 0
      pendingTasks.value = response.data.task_stats.pending_tasks || 0
      inProgressTasks.value = response.data.task_stats.in_progress_tasks || 0
    } else {
      throw new Error('返回数据格式错误')
    }
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    snackbar.showMessage(
      error.response?.data?.message || error.message || '获取统计数据失败',
      "error"
    )
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.stat-card {
  height: 200px;
}

.number {
  font-size: 36px;
  font-weight: bold;
  color: var(--v-primary-base);
}
</style>
