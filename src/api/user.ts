import http from './request'

export const isLoggedIn = () => {
    return localStorage.getItem("isLoggedIn") === "true"
}

export default {
    login(data: any) {
        return http.post('/login/', data)
    },
    register(data: any) {
        return http.post('/register/', data)
    },
    logout(data: any) {
        return http.post('/logout/', data)
    }
}
