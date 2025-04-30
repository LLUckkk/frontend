import http from './request'

export default {
  submitReview(data: any) {
    return http.post(`/submit_review_result/${data.task_id}/`, data)
  }
}