import http from './request'

export default {
    login(data: any) {
        return http.post('/login/', data)
    },
    register(data: any) {
        return http.post('/register/', data)
    }
}
