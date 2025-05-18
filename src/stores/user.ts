// stores/user.ts
import { defineStore } from 'pinia';
import user from '@/api/user';

interface UserState {
  username: string;
  email: string;
  role: string;
  profile: string;
  avatar: string;
  isLoaded: boolean;
}

const API_BASE_URL = 'http://122.9.45.122';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    username: '',
    email: '',
    role: '',
    profile: '',
    avatar: './192.png',
    isLoaded: false
  }),
  
  actions: {
    async fetchUserInfo() {
      try {
        const response = await user.getUserInfo();
        this.username = response.data.username || '';
        this.email = response.data.email || '';
        this.role = response.data.role || '';
        this.profile = response.data.profile || '';
        this.avatar = response.data.avatar ? `${API_BASE_URL}${response.data.avatar}` : './192.png';
        this.isLoaded = true;
        return true;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.isLoaded = false;
        return false;
      }
    },
    
    clearUserInfo() {
      this.username = '';
      this.email = '';
      this.role = '';
      this.profile = '';
      this.avatar = './192.png';
      this.isLoaded = false;
    }
  },
  
  getters: {
    displayName: (state) => state.username || '未登录',
    userRole: (state) => state.role || '未设置',
    hasUserInfo: (state) => state.isLoaded
  }
}); 