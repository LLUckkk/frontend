<template>
  <div class="login-page">
    <!-- 左侧功能介绍区域 -->
    <div class="feature-section">
      <div class="feature-content">
        <h1 class="text-h4 font-weight-bold mb-12">学术造假检测平台</h1>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-magnify</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">横向检测</div>
              <div class="text-body-2 text-grey">将上传作业与知网和有关学术期刊、博硕士学位论文等海量数据进行比对</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-compare</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">纵向检测</div>
              <div class="text-body-2 text-grey">将历年电子版作业上传至检测系统比对库中，作为检测比对数据源</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-account-group</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">校内互检</div>
              <div class="text-body-2 text-grey">与校内同期学生作业比对，防止同期学生相互抄袭</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-pencil</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">写作训练辅助</div>
              <div class="text-body-2 text-grey">在学生课程作业的完成过程中，为学生提供不同阶段所需写作辅助服务</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-school</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">课程、教师/助教、学生网状强连接</div>
              <div class="text-body-2 text-grey">支持学生多门课程，多个课程，多次作业，多个版本的检测和管理</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-chart-bar</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">多维统计分析</div>
              <div class="text-body-2 text-grey">支持按照课程、教师、学生等不同维度进行信息实时统计分析</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-container">
        <div class="login-tabs mb-8">
          <v-btn-toggle
            v-model="loginType"
            mandatory
            divided
            class="login-toggle"
          >
            <v-btn value="login" class="flex-grow-1" :class="{ 'active-tab': loginType === 'login' }">登录</v-btn>
            <v-btn value="register" class="flex-grow-1" :class="{ 'active-tab': loginType === 'register' }">注册</v-btn>
          </v-btn-toggle>
        </div>

        <div class="role-selector mb-8">
          <v-btn-toggle
            v-model="selectedRole"
            mandatory
            class="role-toggle"
          >
            <v-btn 
              value="admin" 
              :class="{ 'active-role': selectedRole === 'admin' }"
              class="role-btn"
            >管理员</v-btn>
            <v-btn 
              value="publisher" 
              :class="{ 'active-role': selectedRole === 'publisher' }"
              class="role-btn"
            >出版社</v-btn>
            <v-btn 
              value="reviewer" 
              :class="{ 'active-role': selectedRole === 'reviewer' }"
              class="role-btn"
            >审稿人</v-btn>
          </v-btn-toggle>
        </div>

        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="username"
            label="请输入用户名"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            prepend-inner-icon="mdi-account"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="输入密码"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            type="password"
            prepend-inner-icon="mdi-lock"
          ></v-text-field>

          <!-- 验证码区域 -->
          <div class="captcha-section mb-6">
            <v-text-field
              v-model="captchaInput"
              label="请输入验证码"
              variant="outlined"
              density="comfortable"
              :error-messages="captchaError"
              class="captcha-input"
              prepend-inner-icon="mdi-shield-check"
            >
              <template v-slot:append>
                <DynamicCaptcha
                  ref="captchaRef"
                  @update:code="code => captchaCode = code"
                />
              </template>
            </v-text-field>
          </div>

          <v-checkbox
            v-model="agreement"
            label="我已阅读《隐私政策》和《使用协议》"
            hide-details
            class="mb-6"
          ></v-checkbox>

          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            :disabled="!agreement"
          >
            {{ loginType === 'login' ? '登录' : '注册' }}
          </v-btn>

          <div class="text-body-2 text-grey text-center mt-4">
            <a href="#" class="text-decoration-none">忘记密码？</a>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DynamicCaptcha from '@/components/DynamicCaptcha.vue'

const router = useRouter()
const captchaRef = ref()
const loginType = ref('login')
const selectedRole = ref('reviewer')
const username = ref('')
const password = ref('')
const agreement = ref(false)

// 验证码相关
const captchaInput = ref('')
const captchaCode = ref('')
const captchaError = ref('')

const validateCaptcha = () => {
  if (!captchaInput.value) {
    captchaError.value = '请输入验证码'
    return false
  }
  if (captchaInput.value.toLowerCase() !== captchaCode.value.toLowerCase()) {
    captchaError.value = '验证码错误'
    captchaInput.value = ''
    captchaRef.value?.refreshCaptcha()
    return false
  }
  captchaError.value = ''
  return true
}

const handleSubmit = () => {
  if (!validateCaptcha()) {
    return
  }
  // 继续登录流程...
  if (loginType.value === 'login') {
    router.push('/task')
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
  padding-top: 40px;
}

.feature-section {
  flex: 1;
  padding: 24px 48px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: rgb(var(--v-theme-surface));
}

.feature-content {
  max-width: 800px;
  margin-top: -20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.feature-text {
  flex: 1;
}

.login-section {
  width: 480px;
  background-color: white;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 48px;
  margin-top: -20px;
}

.login-container {
  width: 100%;
  max-width: 360px;
}

.login-toggle {
  width: 100%;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.login-toggle .v-btn {
  background-color: transparent;
  color: #606266;
  font-weight: 500;
  height: 44px;
  transition: all 0.3s ease;
}

.login-toggle .active-tab {
  background-color: #409eff;
  color: white;
}

.role-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: none;
}

.role-btn {
  flex: 1;
  background-color: #f5f7fa !important;
  color: #606266 !important;
  border: 2px solid transparent !important;
  transition: all 0.3s ease;
  height: 40px;
  font-weight: 500;
}

.role-btn:hover {
  background-color: #ecf5ff !important;
  color: #409eff !important;
}

.active-role {
  background-color: #ecf5ff !important;
  color: #409eff !important;
  border-color: #409eff !important;
}

.v-btn {
  text-transform: none !important;
}


.v-btn.v-btn--size-large {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background-color: #409eff !important;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.v-btn.v-btn--size-large:hover {
  background-color: #66b1ff !important;
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.v-btn.v-btn--size-large:active {
  background-color: #3a8ee6 !important;
  transform: translateY(0);
}

.captcha-section {
  width: 100%;
}

.captcha-input {
  width: 100%;
}

:deep(.v-field__append-inner) {
  padding-top: 6px;
}

@media (max-width: 1024px) {
  .login-page {
    flex-direction: column;
    padding-top: 20px;
  }

  .feature-section {
    padding: 24px;
  }

  .feature-content {
    margin-top: 0;
  }

  .login-section {
    width: 100%;
    margin-top: 0;
    padding: 24px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style> 