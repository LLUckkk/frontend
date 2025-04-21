import http from './request'

export default{
  getTaskData(){
    return http.get('/admin_dashboard')
  }
}