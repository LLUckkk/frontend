import request from '@/api/request'

// 模拟组织数据
const mockOrganizations = [
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

export default {
  // 获取组织列表
  getOrganizations() {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            organizations: mockOrganizations
          }
        })
      }, 500)
    })
  }
} 