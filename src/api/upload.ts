import http from './request'

interface UploadResponse {
  message: string
  file_id: string
  file_url: string
}

interface ExtractedImagesResponse {
  images: Array<{
    url: string
    name: string
    size: string
    type: string
  }>
}

export default {
  uploadFile(formData: FormData) {
    return http.post<UploadResponse>('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getExtractedImages(fileId: string) {
    return http.get<ExtractedImagesResponse>(`/upload/${fileId}/images/`)
  }
}
