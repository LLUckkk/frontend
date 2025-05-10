import request from '@/api/request'

// 模拟文件数据
const mockFiles = [
  {
    id: 1,
    username: '张三',
    tag: 'Biology',
    upload_time: '2024-03-15 10:30:00',
    file_url: '/images/files/bio-1.jpg',
    ai_checked: true,
    manually_checked: true,
    result: true,
    organization: {
      id: 1,
      name: '生物医学研究组',
      description: '专注于生物医学图像研究',
      logo: '/images/orgs/bio-med.png'
    }
  },
  {
    id: 2,
    username: '李四',
    tag: 'Medicine',
    upload_time: '2024-03-15 11:20:00',
    file_url: '/images/files/med-1.jpg',
    ai_checked: true,
    manually_checked: false,
    result: null,
    organization: {
      id: 4,
      name: '医学影像研究所',
      description: '医学影像诊断与分析',
      logo: '/images/orgs/med-img.png'
    }
  },
  {
    id: 3,
    username: '王五',
    tag: 'Chemistry',
    upload_time: '2024-03-15 14:15:00',
    file_url: '/images/files/chem-1.jpg',
    ai_checked: true,
    manually_checked: true,
    result: false,
    organization: {
      id: 2,
      name: '化学分析实验室',
      description: '化学图像分析与处理',
      logo: '/images/orgs/chem-lab.png'
    }
  },
  {
    id: 4,
    username: '赵六',
    tag: 'Graphics',
    upload_time: '2024-03-15 16:45:00',
    file_url: '/images/files/graphics-1.jpg',
    ai_checked: false,
    manually_checked: false,
    result: null,
    organization: {
      id: 3,
      name: '图形学研究中心',
      description: '计算机图形学与图像处理',
      logo: '/images/orgs/graphics.png'
    }
  }
]

// 模拟图片详情数据
const mockFileImages = {
  1: [
    {
      img_id: 101,
      img_url: '/images/files/bio-1-1.jpg',
      isDetect: 'true',
      isReview: 'true',
      isFake: 'true'
    },
    {
      img_id: 102,
      img_url: '/images/files/bio-1-2.jpg',
      isDetect: 'true',
      isReview: 'true',
      isFake: 'false'
    }
  ],
  2: [
    {
      img_id: 201,
      img_url: '/images/files/med-1-1.jpg',
      isDetect: 'true',
      isReview: 'false',
      isFake: null
    }
  ],
  3: [
    {
      img_id: 301,
      img_url: '/images/files/chem-1-1.jpg',
      isDetect: 'true',
      isReview: 'true',
      isFake: 'false'
    }
  ],
  4: [
    {
      img_id: 401,
      img_url: '/images/files/graphics-1-1.jpg',
      isDetect: 'false',
      isReview: 'false',
      isFake: null
    }
  ]
}

// 模拟统计数据
const mockStats = {
  totalFiles: 156,
  verifiedFiles: 89,
  pendingFiles: 45,
  rejectedFiles: 22
}

export default {
  // 获取文件列表
  getFiles(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟筛选
        let filteredFiles = [...mockFiles]
        
        if (params.organization_id) {
          filteredFiles = filteredFiles.filter(file => file.organization.id === params.organization_id)
        }
        
        if (params.subject) {
          filteredFiles = filteredFiles.filter(file => file.tag === params.subject)
        }
        
        // 模拟分页
        const start = (params.page - 1) * params.page_size
        const end = start + params.page_size
        const paginatedFiles = filteredFiles.slice(start, end)
        
        resolve({
          data: {
            files: paginatedFiles,
            current_page: params.page,
            total_pages: Math.ceil(filteredFiles.length / params.page_size),
            total_files: filteredFiles.length
          }
        })
      }, 500)
    })
  },

  // 获取文件统计信息
  getFileStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockStats
        })
      }, 300)
    })
  },

  // 获取文件图片列表
  getFileImages(fileId: number, params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const images = mockFileImages[fileId as keyof typeof mockFileImages] || []
        
        // 模拟筛选
        let filteredImages = [...images]
        
        if (params.isDetect !== 'all') {
          filteredImages = filteredImages.filter(img => img.isDetect === params.isDetect)
        }
        
        if (params.isReview !== 'all') {
          filteredImages = filteredImages.filter(img => img.isReview === params.isReview)
        }
        
        if (params.isFake !== 'all') {
          filteredImages = filteredImages.filter(img => img.isFake === params.isFake)
        }
        
        // 模拟分页
        const start = (params.page - 1) * params.page_size
        const end = start + params.page_size
        const paginatedImages = filteredImages.slice(start, end)
        
        resolve({
          data: {
            imgs: paginatedImages,
            has_next: end < filteredImages.length
          }
        })
      }, 300)
    })
  },

  // 删除文件
  deleteFile(fileId: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true
          }
        })
      }, 300)
    })
  },

  // 删除图片
  deleteImage(imageId: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true
          }
        })
      }, 300)
    })
  }
} 