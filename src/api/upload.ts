import http from './request'

export default {
  uploadFile(data: any) {
    console.log('upload success!')
    return http.post('/upload/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getExtractedImages(data: any) {
    return http.get(`/upload/${data.file_id}/extract_images/?page=${data.page_number}&page_size=${data.page_size}`)
  },

  addTag(data: any) {
    console.log(data)
    return http.post(`/upload/${data.fileId}/addTag/`, {tag:data.tag})
  }
}
