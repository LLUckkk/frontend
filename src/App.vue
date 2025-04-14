<template>
  <v-app :theme="theme">
    <Snackbar />

    <!-- 只在非移动端显示侧边导航栏 -->
    <v-navigation-drawer
      v-if="!isMobile"
      v-model="drawer"
      :rail="rail"
      :permanent="true"
      :temporary="false"
      location="left"
      class="navigation-drawer"
      @mouseenter="rail = false"
      @mouseleave="rail = true"
      :width="rail ? 56 : 200"
    >
      <v-list>
        <v-list-item
          :prepend-avatar="isLoggedIn ? userStore.avatar : undefined"
          :subtitle="userStore.userRole"
          :title="userStore.displayName"
        >
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home" title="主页" value="home" @click="goToHome"></v-list-item>
        <v-list-item prepend-icon="mdi-image" title="上传任务" value="upload" @click="goToUpload"></v-list-item>
        <v-list-item prepend-icon="mdi-history" title="检测历史" value="history" @click="goToHistory"></v-list-item>
        <v-list-item prepend-icon="mdi-book-open-page-variant" title="审阅" value="review" @click="goToReview"></v-list-item>
        <v-list-item 
          v-if="isLoggedIn"
          prepend-icon="mdi-account" 
          title="个人主页" 
          value="profile" 
          @click="goToProfile"
        ></v-list-item>
        <v-list-item 
          v-if="isLoggedIn"
          prepend-icon="mdi-logout" 
          title="退出登录" 
          value="logout"
          @click="handleLogout"
        ></v-list-item>
        <v-list-item 
          v-else
          prepend-icon="mdi-login" 
          title="登录" 
          value="login"
          @click="goToLogin"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar class="app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="!isMobile"></v-app-bar-nav-icon>
      <v-toolbar-title>学术图像检测系统</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn 
        :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
      ></v-btn>
      <v-btn 
        v-if="isLoggedIn"
        :color="hasUnreadNotifications ? 'red' : ''"
        :icon="hasUnreadNotifications ? 'mdi-bell-badge' : 'mdi-bell-outline'"
        @click="showNotifications = true"
      ></v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- 移动端底部导航栏 -->
    <v-bottom-navigation v-if="isMobile">
      <v-btn to="/" value="home">
        <v-icon>mdi-home</v-icon>
        <span>主页</span>
      </v-btn>
      <v-btn to="/upload" value="upload">
        <v-icon>mdi-image</v-icon>
        <span>上传任务</span>
      </v-btn>
      <v-btn to="/history" value="history">
        <v-icon>mdi-history</v-icon>
        <span>检测历史</span>
      </v-btn>
      <v-btn to="/review" value="review">
        <v-icon>mdi-book-open-page-variant</v-icon>
        <span>审阅</span>
      </v-btn>
      <v-btn 
        v-if="isLoggedIn"
        to="/profile"
        value="profile"
      >
        <v-icon>mdi-account</v-icon>
        <span>个人主页</span>
      </v-btn>
      <v-btn 
        v-if="isLoggedIn"
        @click="handleLogout"
        value="logout"
      >
        <v-icon>mdi-logout</v-icon>
        <span>退出登录</span>
      </v-btn>
      <v-btn 
        v-else
        @click="goToLogin"
        value="login"
      >
        <v-icon>mdi-login</v-icon>
        <span>登录</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- 通知对话框 -->
    <v-dialog v-model="showNotifications" max-width="700px">
      <v-card>
        <v-card-title>通知</v-card-title>
        <v-card-text>
          <!-- 这里可以添加通知列表 -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showNotifications = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { isLoggedIn } from './api/user'
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
import user from '@/api/user'
import Snackbar from '@/components/Snackbar.vue'
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();

import { useSnackbarStore } from '@/stores/snackbar';
const snackbar = useSnackbarStore();


const drawer = ref(true)
const rail = ref(true)
const theme = ref('light')
const showNotifications = ref(false)
const hasUnreadNotifications = ref(false)
const router = useRouter()


const goToHome = () => {
  router.push('/')
}

const goToUpload = () => {
  router.push('/upload')
}

const goToHistory = () => {
  router.push('/history')
}

const goToReview = () => {
  router.push('/review')
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = async() => {
  try {
    // localStorage.clear()
    let refresh = localStorage.getItem("refresh")
    const response = await user.logout({refresh})
    localStorage.removeItem("refresh")
    localStorage.removeItem("token")
    isLoggedIn.value = false
    localStorage.setItem("isLoggedIn", "false")
    userStore.clearUserInfo() // 清除用户信息
    snackbar.showMessage('退出成功', 'success')
    router.push('/login')
  } catch (error: any) {
    snackbar.showMessage('请联系管理员', 'error')
  }
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('app_theme', theme.value)
}

const goToProfile = () => {
  router.push('/profile')
}

onMounted(async () => {
  // 从本地存储加载主题设置
  const savedTheme = localStorage.getItem('app_theme')
  if (savedTheme) {
    theme.value = savedTheme
  }
  
  // 如果已登录，获取用户信息
  if (isLoggedIn.value) {
    await userStore.fetchUserInfo();
  }
})
</script>

<style>
.v-navigation-drawer__content {
  overflow-y: auto;
}

.navigation-drawer {
  position: fixed !important;
  z-index: 1000;
  transition: all 0.3s ease-in-out !important;
  background-color: rgb(var(--v-theme-surface)) !important;
}

/* 移除主内容区域的左边距 */
.v-main {
  margin-left: 0 !important;
  padding-left: 56px !important;
}

/* 确保导航栏展开时不会影响主内容区域 */
.v-navigation-drawer--rail {
  position: fixed !important;
  z-index: 1000;
}

.v-navigation-drawer--rail:not(:hover) {
  width: 56px !important;
}

.v-navigation-drawer--rail:hover {
  width: 200px !important;
}

/* 固定顶部栏 */
.app-bar {
  position: fixed !important;
  z-index: 1001 !important;
  width: 100% !important;
  left: 0 !important;
  right: 0 !important;
}

/* 调整主内容区域的上边距，为固定顶部栏留出空间 */
.v-main {
  padding-top: 64px !important;
}
</style>
