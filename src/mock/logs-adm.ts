// 模拟组织数据
export const mockOrganizations = [
  {
    id: 1,
    name: '生物医学研究组',
    description: '专注于生物医学图像研究',
    logo: '/images/orgs/bio-med.png'
  },
  {
    id: 2,
    name: '化学分析实验室',
    description: '化学图像分析与处理',
    logo: '/images/orgs/chem-lab.png'
  },
  {
    id: 3,
    name: '图形学研究中心',
    description: '计算机图形学与图像处理',
    logo: '/images/orgs/graphics.png'
  },
  {
    id: 4,
    name: '医学影像研究所',
    description: '医学影像诊断与分析',
    logo: '/images/orgs/med-img.png'
  }
]

// 模拟日志数据
export const mockLogs = {
  logs: [
    // 上传操作
    {
      id: 1,
      user: '张三',
      operation_type: 'upload',
      related_model: 'FileManagement',
      related_id: 101,
      operation_time: '2024-03-15 10:30:00',
      organization_id: 1,
      description: '上传生物医学图像'
    },
    {
      id: 2,
      user: '李四',
      operation_type: 'upload',
      related_model: 'FileManagement',
      related_id: 102,
      operation_time: '2024-03-15 11:20:00',
      organization_id: 2,
      description: '上传化学分析图像'
    },
    // 检测操作
    {
      id: 3,
      user: '王五',
      operation_type: 'detection',
      related_model: 'DetectionTask',
      related_id: 201,
      operation_time: '2024-03-15 14:15:00',
      organization_id: 1,
      description: '执行AI图像检测'
    },
    {
      id: 4,
      user: '赵六',
      operation_type: 'detection',
      related_model: 'DetectionTask',
      related_id: 202,
      operation_time: '2024-03-15 16:45:00',
      organization_id: 2,
      description: '执行AI图像检测'
    },
    // 审核请求操作
    {
      id: 5,
      user: '张三',
      operation_type: 'review_request',
      related_model: 'ReviewRequest',
      related_id: 301,
      operation_time: '2024-03-15 17:30:00',
      organization_id: 3,
      description: '提交图像审核请求'
    },
    {
      id: 6,
      user: '李四',
      operation_type: 'review_request',
      related_model: 'ReviewRequest',
      related_id: 302,
      operation_time: '2024-03-15 18:20:00',
      organization_id: 4,
      description: '提交图像审核请求'
    },
    // 人工审核操作
    {
      id: 7,
      user: '王五',
      operation_type: 'manual_review',
      related_model: 'ManualReview',
      related_id: 401,
      operation_time: '2024-03-15 19:15:00',
      organization_id: 3,
      description: '完成人工审核'
    },
    {
      id: 8,
      user: '赵六',
      operation_type: 'manual_review',
      related_model: 'ManualReview',
      related_id: 402,
      operation_time: '2024-03-15 20:45:00',
      organization_id: 4,
      description: '完成人工审核'
    }
  ],
  current_page: 1,
  total_pages: 1,
  total_logs: 8
}

// 模拟统计数据
export const mockStats = {
  totalLogs: 156,
  uploadLogs: 45,    // 上传操作数
  detectionLogs: 38, // 检测操作数
  reviewRequestLogs: 35, // 审核请求数
  manualReviewLogs: 38  // 人工审核数
}

// 模拟API响应
export const mockApi = {
  // 获取组织列表
  getOrganizations() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            organizations: mockOrganizations
          }
        })
      }, 500)
    })
  },

  // 获取日志列表
  getLogs(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟筛选
        let filteredLogs = [...mockLogs.logs]
        
        if (params.organization_id) {
          filteredLogs = filteredLogs.filter(log => log.organization_id === params.organization_id)
        }
        
        if (params.operation_type) {
          filteredLogs = filteredLogs.filter(log => log.operation_type === params.operation_type)
        }
        
        // 模拟分页
        const start = (params.page - 1) * params.page_size
        const end = start + params.page_size
        const paginatedLogs = filteredLogs.slice(start, end)
        
        resolve({
          data: {
            logs: paginatedLogs,
            current_page: params.page,
            total_pages: Math.ceil(filteredLogs.length / params.page_size),
            total_logs: filteredLogs.length
          }
        })
      }, 500)
    })
  },

  // 获取日志统计信息
  getLogStats(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 根据组织ID调整统计数据
        let stats = { ...mockStats }
        if (params.organization_id) {
          const orgLogs = mockLogs.logs.filter(log => log.organization_id === params.organization_id)
          stats.totalLogs = orgLogs.length
          stats.uploadLogs = orgLogs.filter(log => log.operation_type === 'upload').length
          stats.detectionLogs = orgLogs.filter(log => log.operation_type === 'detection').length
          stats.reviewRequestLogs = orgLogs.filter(log => log.operation_type === 'review_request').length
          stats.manualReviewLogs = orgLogs.filter(log => log.operation_type === 'manual_review').length
        }
        
        resolve({
          data: stats
        })
      }, 300)
    })
  },

  // 下载日志
  downloadLogs(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟CSV数据
        const csvContent = '操作用户,操作类型,相关模型,相关ID,操作时间\n' +
          mockLogs.logs
            .filter(log => !params.organization_id || log.organization_id === params.organization_id)
            .map(log => `${log.user},${log.operation_type},${log.related_model},${log.related_id},${log.operation_time}`)
            .join('\n')
        
        resolve({
          data: csvContent
        })
      }, 500)
    })
  }
} 