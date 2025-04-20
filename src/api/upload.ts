import http from './request'

export default {
  uploadFile(data: any)  {
    console.log('upload success!')
    return http.post('/upload/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getExtractedImages(data: any)  {
    console.log(data)
    return http.get(`/upload/${data}/extract_images/`)
  }
}
