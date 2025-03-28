<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <!-- 个人信息卡片 -->
        <v-card class="mb-4">
          <v-card-item>
            <v-avatar size="100" class="mb-4">
              <v-img :src="userInfo.avatar || './192.png'" cover></v-img>
            </v-avatar>
            <v-card-title>{{ userInfo.name || '未登录' }}</v-card-title>
            <v-card-subtitle>{{ userInfo.student_id || '请登录' }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>邮箱</v-list-item-title>
                <v-list-item-subtitle>{{ userInfo.email || '未设置' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-phone</v-icon>
                </template>
                <v-list-item-title>电话</v-list-item-title>
                <v-list-item-subtitle>{{ userInfo.phone || '未设置' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- 统计信息卡片 -->
        <v-card>
          <v-card-title>统计信息</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-image</v-icon>
                </template>
                <v-list-item-title>已上传任务</v-list-item-title>
                <v-list-item-subtitle>{{ stats.uploadedTasks || 0 }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>已完成任务</v-list-item-title>
                <v-list-item-subtitle>{{ stats.completedTasks || 0 }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <!-- 最近活动 -->
        <v-card>
          <v-card-title>最近活动</v-card-title>
          <v-card-text>
            <v-timeline>
              <v-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :dot-color="activity.color"
                size="small"
              >
                <div class="d-flex justify-space-between">
                  <div>
                    <div class="text-subtitle-1">{{ activity.title }}</div>
                    <div class="text-caption">{{ activity.time }}</div>
                  </div>
                  <v-chip
                    :color="activity.statusColor"
                    size="small"
                  >
                    {{ activity.status }}
                  </v-chip>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 模拟用户信息
const userInfo = ref({
  name: '张三',
  student_id: '2023000000',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  avatar: './192.png'
})

// 模拟统计信息
const stats = ref({
  uploadedTasks: 10,
  completedTasks: 8
})

// 模拟最近活动
const recentActivities = ref([
  {
    title: '上传新任务',
    time: '2024-03-20 14:30',
    status: '处理中',
    statusColor: 'warning',
    color: 'primary'
  },
  {
    title: '任务检测完成',
    time: '2024-03-19 16:45',
    status: '已完成',
    statusColor: 'success',
    color: 'success'
  },
  {
    title: '上传新任务',
    time: '2024-03-18 09:15',
    status: '已完成',
    statusColor: 'success',
    color: 'primary'
  }
])
</script> 