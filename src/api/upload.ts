import http from './request'

export default {
  uploadFile(data: any)  {
    return http.post('/upload/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getExtractedImages(data: any)  {
    return http.get(`/api/upload/${data}/extract_images/`)
  }
}
