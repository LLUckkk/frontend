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
          <!-- 登录表单 -->
          <template v-if="loginType === 'login'">
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
          </template>

          <!-- 注册表单 -->
          <template v-else>
            <v-text-field
              v-model="registerForm.username"
              label="设置用户名"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-account"
              :rules="[v => !!v || '用户名不能为空', v => v.length >= 4 || '用户名至少4个字符']"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.password"
              label="设置密码"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              type="password"
              prepend-inner-icon="mdi-lock"
              :rules="[v => !!v || '密码不能为空', v => v.length >= 6 || '密码至少6个字符']"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.confirmPassword"
              label="确认密码"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              type="password"
              prepend-inner-icon="mdi-lock-check"
              :rules="[v => !!v || '请确认密码', v => v === registerForm.password || '两次输入的密码不一致']"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.email"
              label="邮箱"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-email"
              :rules="[v => !!v || '邮箱不能为空', v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址']"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.phone"
              label="手机号码"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-phone"
              :rules="[v => !!v || '手机号不能为空', v => /^1[3-9]\d{9}$/.test(v) || '请输入有效的手机号']"
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
              label="我已阅读并同意《隐私政策》和《使用协议》"
              hide-details
              class="mb-6"
              :rules="[v => !!v || '请阅读并同意相关协议']"
            ></v-checkbox>
          </template>

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
            <template v-if="loginType === 'login'">
              <a href="#" class="text-decoration-none" @click.prevent="showForgotPasswordDialog = true">忘记密码？</a>
            </template>
            <template v-else>
              <span>已有账号？</span>
              <a href="#" class="text-decoration-none ml-1" @click.prevent="loginType = 'login'">立即登录</a>
            </template>
          </div>
        </v-form>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <v-dialog
      v-model="showForgotPasswordDialog"
      width="auto"
      persistent
      scrollable
    >
      <forgot-password @close="showForgotPasswordDialog = false" />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DynamicCaptcha from '@/components/DynamicCaptcha.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'

const router = useRouter()
const captchaRef = ref()
const loginType = ref('login')
const selectedRole = ref('reviewer')
const username = ref('')
const password = ref('')
const agreement = ref(false)
const showForgotPasswordDialog = ref(false)

// 注册表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
})

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
  // 继续登录/注册流程...
  if (loginType.value === 'login') {
    router.push('/task')
  } else {
    // 处理注册逻辑
    console.log('注册信息：', registerForm.value)
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background-color: var(--v-theme-background);
  padding-top: 40px;
}

.feature-section {
  flex: 1;
  padding: 24px 48px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--v-theme-surface);
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
  background-color: var(--v-theme-surface);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 48px;
  margin-top: -20px;
}

.login-container {
  width: 100%;
  max-width: 360px;
  background-color: var(--v-theme-surface);
}

.login-toggle {
  width: 100%;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--v-theme-surface);
}

.login-toggle .v-btn {
  background-color: transparent;
  color: var(--v-theme-on-surface);
  font-weight: 500;
  height: 44px;
  transition: all 0.3s ease;
}

.login-toggle .active-tab {
  background-color: var(--v-theme-primary);
  color: var(--v-theme-on-primary);
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
  background-color: var(--v-theme-surface) !important;
  color: var(--v-theme-on-surface) !important;
  border: none !important;
  transition: all 0.3s ease;
  height: 40px;
  font-weight: 500;
}

.role-btn:hover {
  background-color: var(--v-theme-primary-light) !important;
  color: var(--v-theme-on-primary) !important;
}

.active-role {
  background-color: var(--v-theme-primary) !important;
  color: var(--v-theme-on-primary) !important;
  border: none !important;
}

.v-btn {
  text-transform: none !important;
  background-color: var(--v-theme-primary);
  color: var(--v-theme-on-primary);
}

.v-btn.v-btn--size-large {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.v-btn.v-btn--size-large:hover {
  background-color: var(--v-theme-primary-light);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.v-btn.v-btn--size-large:active {
  background-color: var(--v-theme-primary-dark);
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

.forgot-password-dialog :deep(.v-overlay__content) {
  opacity: 1;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.forgot-password-dialog :deep(.v-overlay__scrim) {
  opacity: 0.7;
  background-color: rgb(var(--v-theme-on-surface));
}
</style> 