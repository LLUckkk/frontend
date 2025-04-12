import http from './request'

export default {
    login(data: any) {
        return http.post('/login', data)
    },
}
