import http from './request'

export default {
  getUnRead() {
    return http.get('notification/notify/')
  },

  setReadAll() {
    return http.post('/notification/set_as_read/')
  },

  getAllNotifications() {
    return http.get('/notification/get/')
  }
}