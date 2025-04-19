<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <!-- 个人信息卡片 -->
        <v-card class="mb-4">
          <v-card-item>
            <div class="d-flex justify-center">
              <v-avatar size="120" class="mb-4 position-relative">
                <v-img :src="userStore.avatar" cover></v-img>
                <v-btn icon="mdi-camera" variant="flat" color="primary" size="small" class="position-absolute"
                  style="bottom: 0; right: 0" @click="triggerFileInput"></v-btn>
              </v-avatar>
            </div>
            <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleAvatarChange">
            <v-card-title class="text-center">{{ userStore.displayName }}</v-card-title>
            <v-card-subtitle class="text-center">{{ userStore.userRole }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>邮箱</v-list-item-title>
                <v-list-item-subtitle>{{ userStore.email || '未设置' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>个人简介</v-list-item-title>
                <v-list-item-subtitle>{{ userStore.profile || '未设置' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-pencil" @click="showEditDialog = true">
              编辑个人信息
            </v-btn>
            <v-btn color="warning" variant="outlined" prepend-icon="mdi-lock-reset" @click="showPasswordDialog = true">
              修改密码
            </v-btn>
          </v-card-actions>
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
              <v-timeline-item v-for="(activity, index) in recentActivities" :key="index" :dot-color="activity.color"
                size="small">
                <div class="d-flex justify-space-between">
                  <div>
                    <div class="text-subtitle-1">{{ activity.title }}</div>
                    <div class="text-caption">{{ activity.time }}</div>
                  </div>
                  <v-chip :color="activity.statusColor" size="small">
                    {{ activity.status }}
                  </v-chip>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 编辑个人信息对话框 -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>编辑个人信息</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="editForm.username" label="用户名" variant="outlined" class="mb-4"></v-text-field>
            <v-text-field v-model="editForm.email" label="邮箱" variant="outlined" class="mb-4"></v-text-field>
            <v-textarea v-model="editForm.profile" label="个人简介" variant="outlined" rows="3"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showEditDialog = false">
            取消
          </v-btn>
          <v-btn color="primary" variant="text" @click="handleUpdateProfile" :loading="updating">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 修改密码对话框 -->
    <v-dialog v-model="showPasswordDialog" max-width="500">
      <v-card>
        <v-card-title>修改密码</v-card-title>
        <v-card-text>
          <v-form>
            <div class="d-flex align-center mb-4">
              <v-text-field 
                v-model="passwordForm.email" 
                label="邮箱" 
                variant="outlined" 
                :value="userStore.email"
                disabled
                class="flex-grow-1"
              ></v-text-field>
              <v-btn 
                color="primary" 
                class="ml-2"
                @click="requestResetEmail" 
                :loading="sendingEmail"
                :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </v-btn>
            </div>
            
            <v-text-field 
              v-model="passwordForm.verificationCode" 
              label="验证码" 
              variant="outlined" 
              class="mb-4"
              placeholder="请输入收到的验证码"
            ></v-text-field>
            
            <v-text-field 
              v-model="passwordForm.newPassword" 
              label="新密码" 
              type="password"
              variant="outlined" 
              class="mb-4"
              placeholder="请输入新密码"
            ></v-text-field>
            
            <v-text-field 
              v-model="passwordForm.confirmPassword" 
              label="确认新密码" 
              type="password"
              variant="outlined" 
              class="mb-4"
              placeholder="请再次输入新密码"
            ></v-text-field>
            
            <v-btn 
              color="primary" 
              block
              @click="resetPassword" 
              :loading="resettingPassword"
              :disabled="!isPasswordValid"
            >
              重置密码
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closePasswordDialog">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref, computed, onUnmounted } from 'vue'
import user from '@/api/user'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'

const snackbar = useSnackbarStore()
const userStore = useUserStore()
const route = useRoute()

// 编辑表单
const showEditDialog = ref(false)
const updating = ref(false)
const editForm = ref({
  username: '',
  email: '',
  profile: '',
  avatar: null as File | null
})

// 密码重置相关
const showPasswordDialog = ref(false)
const sendingEmail = ref(false)
const resettingPassword = ref(false)
const countdown = ref(0)
const countdownTimer = ref<number | null>(null)
const passwordForm = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 检查URL中是否包含重置密码的token和uidb64
onMounted(() => {
  const uidb64 = route.query.uidb64 as string
  const token = route.query.token as string
  
  if (uidb64 && token) {
    showPasswordDialog.value = true
  }
})

// 密码验证
const isPasswordValid = computed(() => {
  return passwordForm.value.verificationCode && 
         passwordForm.value.newPassword && 
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6
})

// 关闭密码对话框
const closePasswordDialog = () => {
  showPasswordDialog.value = false
  // 重置表单
  setTimeout(() => {
    passwordForm.value = {
      email: userStore.email,
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    }
    // 清除倒计时
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
    countdown.value = 0
  }, 300)
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  countdownTimer.value = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
    }
  }, 1000)
}

// 请求重置密码邮件
const requestResetEmail = async () => {
  try {
    sendingEmail.value = true
    await user.requestPasswordReset(passwordForm.value.email)
    snackbar.showMessage('验证码已发送，请查收邮箱', 'success')
    startCountdown()
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    const errorMsg = error.response?.data?.message || '发送验证码失败'
    snackbar.showMessage(errorMsg, 'error')
  } finally {
    sendingEmail.value = false
  }
}

// 重置密码
const resetPassword = async () => {
  if (!isPasswordValid.value) {
    snackbar.showMessage('请确保两次输入的密码一致且长度不少于6位', 'error')
    return
  }
  
  try {
    resettingPassword.value = true
    // 这里假设后端API接受验证码作为token
    await user.resetPassword('verification', passwordForm.value.verificationCode, passwordForm.value.newPassword)
    snackbar.showMessage('密码重置成功', 'success')
    closePasswordDialog()
  } catch (error: any) {
    console.error('重置密码失败:', error)
    const errorMsg = error.response?.data?.message || '重置密码失败'
    snackbar.showMessage(errorMsg, 'error')
  } finally {
    resettingPassword.value = false
  }
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
})

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null)

// 获取用户信息
onMounted(async () => {
  try {
    await userStore.fetchUserInfo()
    // 初始化编辑表单
    editForm.value = {
      username: userStore.username,
      email: userStore.email,
      profile: userStore.profile,
      avatar: null
    }
    // 初始化密码表单
    passwordForm.value.email = userStore.email
  } catch (error) {
    console.error('获取用户信息失败:', error)
    snackbar.showMessage('获取用户信息失败', 'error')
  }
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理头像上传
const handleAvatarChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    try {
      // 先预览新头像
      const reader = new FileReader()
      reader.onload = (e) => {
        // 临时更新头像显示
        userStore.avatar = e.target?.result as string
      }
      reader.readAsDataURL(file)
      
      // 上传头像
      const success = await userStore.updateAvatar(file)
      if (success) {
        snackbar.showMessage('头像更新成功', 'success')
      } else {
        // 如果上传失败，恢复原来的头像
        await userStore.fetchUserInfo()
        snackbar.showMessage('头像更新失败', 'error')
      }
    } catch (error) {
      console.error('更新头像失败:', error)
      // 发生错误时恢复原来的头像
      await userStore.fetchUserInfo()
      snackbar.showMessage('头像上传失败', 'error')
    }
  }
}

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    updating.value = true
    const formData = new FormData()

    // 添加文本字段
    formData.append('username', editForm.value.username)
    formData.append('email', editForm.value.email)
    formData.append('profile', editForm.value.profile)

    await user.updateUserInfo(formData)
    
    // 重新获取用户信息以更新 store
    await userStore.fetchUserInfo()
    
    showEditDialog.value = false
    snackbar.showMessage('个人信息更新成功', 'success')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    snackbar.showMessage('更新个人信息失败', 'error')
  } finally {
    updating.value = false
  }
}

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

<style scoped>
.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}
</style>