<template>
  <div class="login-page">
    <!-- 左侧功能介绍区域 -->
    <div class="feature-section">
      <div class="feature-content">
        <h1 class="text-h4 font-weight-bold mb-12">学术图像造假检测平台</h1>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-magnify</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">AI精准检测</div>
              <div class="text-body-2 text-grey">基于深度学习与图像分析技术，精准识别重复、篡改、拼接等学术图像异常。</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-compare</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">秒级快速筛查</div>
              <div class="text-body-2 text-grey">AI预检测可在数秒内完成初筛，大幅降低人工审核成本，提升出版社工作效率</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-account-group</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">双重验证机制</div>
              <div class="text-body-2 text-grey">AI初检+人工复核双保险，确保结果客观可信，降低误判风险。</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-pencil</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">多角色协同平台</div>
              <div class="text-body-2 text-grey">支持出版社、审稿人多端登录，任务进度实时追踪，反馈结果集中归档。</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-school</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">可追溯审计</div>
              <div class="text-body-2 text-grey">所有操作留痕，满足出版机构对流程透明性与合规性的严格要求</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="32" color="primary">mdi-chart-bar</v-icon>
            </div>
            <div class="feature-text">
              <div class="text-subtitle-1 font-weight-medium">多维统计分析</div>
              <div class="text-body-2 text-grey">自动生成结构化检测报告，附带篡改区域标记与证据链，助力学术争议裁定。</div>
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

        <v-form ref="form" @submit.prevent="handleSubmit">
          <!-- 登录表单 -->
          <template v-if="loginType === 'login'">
            <v-text-field
              v-model="email"
              label="请输入邮箱"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-email"
              :rules="loginRules.email"
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="输入密码"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              type="password"
              prepend-inner-icon="mdi-lock"
              :rules="loginRules.password"
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
              :rules="registerRules.username"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.password"
              label="设置密码"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              type="password"
              prepend-inner-icon="mdi-lock"
              :rules="registerRules.password"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.confirmPassword"
              label="确认密码"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              type="password"
              prepend-inner-icon="mdi-lock-check"
              :rules="registerRules.confirmPassword"
            ></v-text-field>

            <v-text-field
              v-model="registerForm.email"
              label="邮箱"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-email"
              :rules="registerRules.email"
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
            :disabled="!isFormValid"
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DynamicCaptcha from '@/components/DynamicCaptcha.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'
import { useSnackbarStore } from '@/stores/snackbar';
const snackbar = useSnackbarStore();
import user from '@/api/user'
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();

const router = useRouter()
const captchaRef = ref()
const snackbarRef = ref()
const loginType = ref('login')
const selectedRole = ref('reviewer')
const email = ref('')
const password = ref('')
const agreement = ref(false)
const showForgotPasswordDialog = ref(false)
const form = ref(null)

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

// 监听登录类型变化，重置验证码
watch(loginType, () => {
  captchaInput.value = ''
  captchaError.value = ''
  captchaRef.value?.refreshCaptcha()
})

// 表单验证规则
const loginRules = {
  email: [
    (v: string) => !!v || '邮箱不能为空',
    (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
  ],
  password: [
    (v: string) => !!v || '密码不能为空',
    (v: string) => v.length >= 6 || '密码至少6个字符'
  ]
}

const registerRules = {
  username: [
    (v: string) => !!v || '用户名不能为空',
    (v: string) => v.length >= 4 || '用户名至少4个字符'
  ],
  password: [
    (v: string) => !!v || '密码不能为空',
    (v: string) => v.length >= 6 || '密码至少6个字符'
  ],
  confirmPassword: [
    (v: string) => !!v || '请确认密码',
    (v: string) => v === registerForm.value.password || '两次输入的密码不一致'
  ],
  email: [
    (v: string) => !!v || '邮箱不能为空',
    (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
  ]
}

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

const isFormValid = computed(() => {
  if (!agreement.value) return false
  if (!captchaInput.value) return false
  
  if (loginType.value === 'login') {
    return email.value && password.value && 
           /.+@.+\..+/.test(email.value) && 
           password.value.length >= 6
  } else {
    return registerForm.value.username && 
           registerForm.value.email && 
           registerForm.value.password && 
           registerForm.value.confirmPassword &&
           registerForm.value.username.length >= 4 &&
           /.+@.+\..+/.test(registerForm.value.email) &&
           registerForm.value.password.length >= 6 &&
           registerForm.value.password === registerForm.value.confirmPassword
  }
})

const handleSubmit = async () => {
  if (!validateCaptcha()) {
    return
  }
  // 继续登录/注册流程...
  if (loginType.value === 'login') {
      const response = await user.login({
        email: email.value,
        password: password.value
      }).then(async res => {
        localStorage.setItem("token", res.data.access)
        localStorage.setItem("refresh", res.data.refresh)
        localStorage.setItem("isLoggedIn", "true")
        
        // 获取用户信息并存储到 user store
        await userStore.fetchUserInfo();
        
        snackbar.showMessage('登录成功', 'success')
        router.push('/')
      }).catch(error => {
        console.log(error)
        let errorMessage = '网络错误，请稍后重试'
        if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = '账号/密码错误'
            break
          default://400
            errorMessage = '请联系管理员'
            break
        }
      }
      snackbar.showMessage(errorMessage, 'error')
    })
  } else {
    try {
      const response = await user.register({
        username: registerForm.value.username,
        email: registerForm.value.email,
        password: registerForm.value.password,
        role: selectedRole
      })
      snackbar.showMessage('注册成功', 'success')
      loginType.value = 'login'
    } catch (error: any) {
      let errorMessage = '注册失败，请稍后重试'
      if (error.response) {
        if (error.response.status === 400) {
          // 处理字段验证错误
          const errors = error.response.data
          const errorMessages = []
          
          if (errors.username) errorMessages.push(`用户名已存在`)
          if (errors.email) errorMessages.push(`邮箱已存在`)
          
          errorMessage = errorMessages.length > 0 ? errorMessages.join(';') : '请检查输入信息'
        }
      }
      snackbar.showMessage(errorMessage, 'error')
    }
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