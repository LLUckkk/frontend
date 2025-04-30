import { da } from 'vuetify/locale'
import http from './request'

export default {
  //发布审核任务
  dispatchAnnual(data: any) {
    return http.post('/create_review_task_with_admin_check/', data)
  },

  //data是taskId
  //返回某个task的所有人工审核任务的完成情况，只返回百分比
  getAllAnnual(data: any) {
    return http.get(`/get_task_completion_status/${data}`)
  },

  //返回某个task的所有images和所有人工审核的结果
  getAnnualDetail(data: any) {
    return http.get(`/get_task_detail/${data}/`)
  },

  //返回特定审核员对特定任务的审核结果
  getReviewerDetail(data: any) {
    return http.get(`/get_task_reviewer_detail/${data.taskId}/${data.reviewer_id}`)
  },

  getAllReviewers() {
    return http.get('/get_all_reviewers/')
  },

  //获取某个出版社所有检测的任务
  getAllDetectionTask() {
    return http.get('/user-tasks/')
  },

  //提交AI检测任务
  submitDetection(data: any) {
    return http.post('/detection/submit/', data)
  },

  //获取某个任务的所有图片的AI检测结果
  getTaskResults(data: any) {
    return http.get(`/tasks/${data}/results/`)
  },

  getFakeImage(data: any) {
    return http.get(`/tasks/${data.task_id}/fake_results/?include_image=${data.include_image}`)
  },

  getNormalImage(data: any) {
    return http.get(`/tasks/${data.task_id}/normal_results/?include_image=${data.include_image}`, )
  },

  getSingleImageResult(data: any) {
    return http.get(`/results/${data}/`)
  },

  downloadReport(data: any) {
    return http.get(`/tasks/${data}/report/`)
  }
}