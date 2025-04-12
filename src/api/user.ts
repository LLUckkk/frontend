import http from './request'
import { ref } from 'vue'

// 使用ref直接管理登录状态
export const isLoggedIn = ref(localStorage.getItem("isLoggedIn") === "true")

export default {
    login(data: any) {
        return http.post('/login/', data).then(res => {
            isLoggedIn.value = true
            localStorage.setItem("isLoggedIn", "true")
            return res
        })
    },
    register(data: any) {
        return http.post('/register/', data)
    },
    logout(data: any) {
        return http.post('/logout/', data).then(res => {
            isLoggedIn.value = false
            localStorage.setItem("isLoggedIn", "false")
            return res
        })
    }
}
