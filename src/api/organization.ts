import http from './request'

export default {
  // 获取组织信息
  getOrgDetail(data: any) {
    return http.get(`/organization/${data.organization_id}/`)
  },

  // 更新组织信息
  updateOrganizationInfo(data: {
    name?: string;
    description?: string;
    logo?: string;
    contact?: string;
  }) {
    return http.put('/organization/info/', data)
  },

  // 上传组织Logo
  uploadLogo(data: FormData) {
    return http.post('/organization/upload_logo/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
} 