// 模拟组织数据
export const mockOrganizations = [
  {
    id: 1,
    name: '生物医学研究组',
    description: '专注于生物医学图像研究',
    logo: '/images/orgs/bio-med.png',
    userCount: 2,
    fileCount: 150
  },
  {
    id: 2,
    name: '化学分析实验室',
    description: '化学图像分析与处理',
    logo: '/images/orgs/chem-lab.png',
    userCount: 2,
    fileCount: 120
  },
  {
    id: 3,
    name: '图形学研究中心',
    description: '计算机图形学与图像处理',
    logo: '/images/orgs/graphics.png',
    userCount: 2,
    fileCount: 200
  },
  {
    id: 4,
    name: '医学影像研究所',
    description: '医学影像诊断与分析',
    logo: '/images/orgs/med-img.png',
    userCount: 2,
    fileCount: 180
  }
]

// 模拟用户数据
export const mockUsers = {
  users: [
    {
      id: 1,
      username: '张三',
      email: 'zhangsan@example.com',
      role: 'publisher',
      permission: '1111',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user1.jpg',
      organization_id: 1,
      organization_name: '生物医学研究组'
    },
    {
      id: 2,
      username: '李四',
      email: 'lisi@example.com',
      role: 'reviewer',
      permission: '0001',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user2.jpg',
      organization_id: 1,
      organization_name: '生物医学研究组'
    },
    {
      id: 3,
      username: '王五',
      email: 'wangwu@example.com',
      role: 'publisher',
      permission: '1100',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user3.jpg',
      organization_id: 2,
      organization_name: '化学分析实验室'
    },
    {
      id: 4,
      username: '赵六',
      email: 'zhaoliu@example.com',
      role: 'reviewer',
      permission: '0001',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user4.jpg',
      organization_id: 2,
      organization_name: '化学分析实验室'
    },
    {
      id: 5,
      username: '孙七',
      email: 'sunqi@example.com',
      role: 'publisher',
      permission: '1110',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user5.jpg',
      organization_id: 3,
      organization_name: '图形学研究中心'
    },
    {
      id: 6,
      username: '周八',
      email: 'zhouba@example.com',
      role: 'reviewer',
      permission: '0001',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user6.jpg',
      organization_id: 3,
      organization_name: '图形学研究中心'
    },
    {
      id: 7,
      username: '吴九',
      email: 'wujiu@example.com',
      role: 'publisher',
      permission: '1111',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user7.jpg',
      organization_id: 4,
      organization_name: '医学影像研究所'
    },
    {
      id: 8,
      username: '郑十',
      email: 'zhengshi@example.com',
      role: 'reviewer',
      permission: '0001',
      registerTime: 1708000000000,
      lastLoginTime: 1708000000000,
      avatar: '/images/avatars/user8.jpg',
      organization_id: 4,
      organization_name: '医学影像研究所'
    }
  ],
  current_page: 1,
  total_pages: 1,
  total_users: 8
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

  // 获取用户列表
  getUsers(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟筛选
        let filteredUsers = [...mockUsers.users]
        
        if (params.organization_id) {
          filteredUsers = filteredUsers.filter(user => user.organization_id === params.organization_id)
        }
        
        if (params.role) {
          filteredUsers = filteredUsers.filter(user => user.role === params.role)
        }
        
        if (params.query) {
          const query = params.query.toLowerCase()
          filteredUsers = filteredUsers.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          )
        }
        
        // 模拟分页
        const start = (params.page - 1) * params.page_size
        const end = start + params.page_size
        const paginatedUsers = filteredUsers.slice(start, end)
        
        resolve({
          data: {
            users: paginatedUsers,
            current_page: params.page,
            total_pages: Math.ceil(filteredUsers.length / params.page_size),
            total_users: filteredUsers.length
          }
        })
      }, 500)
    })
  },

  // 获取用户详情
  getUserInfo(userId: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.users.find(u => u.id === userId)
        resolve({
          data: user
        })
      }, 300)
    })
  },

  // 更新用户权限
  updateUserPermission(userId: number, permission: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.users.find(u => u.id === userId)
        if (user) {
          user.permission = permission
        }
        resolve({
          data: { success: true }
        })
      }, 300)
    })
  },

  // 删除用户
  deleteUser(userId: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockUsers.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          mockUsers.users.splice(index, 1)
        }
        resolve({
          data: { success: true }
        })
      }, 300)
    })
  },

  // 创建管理员
  createAdmin(userData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: mockUsers.users.length + 1,
          ...userData,
          role: 'admin',
          permission: '1111',
          registerTime: Date.now(),
          lastLoginTime: Date.now(),
          avatar: '/images/avatars/default.jpg',
          organization_id: null,
          organization_name: null
        }
        mockUsers.users.push(newUser)
        resolve({
          data: newUser
        })
      }, 300)
    })
  },

  // 创建组织
  createOrganization(orgData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrg = {
          id: mockOrganizations.length + 1,
          ...orgData,
          userCount: 0,
          fileCount: 0
        }
        mockOrganizations.push(newOrg)
        resolve({
          data: newOrg
        })
      }, 300)
    })
  },

  // 更新组织
  updateOrganization(orgId: number, orgData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockOrganizations.findIndex(org => org.id === orgId)
        if (index !== -1) {
          mockOrganizations[index] = {
            ...mockOrganizations[index],
            ...orgData
          }
        }
        resolve({
          data: { success: true }
        })
      }, 300)
    })
  },

  // 删除组织
  deleteOrganization(orgId: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockOrganizations.findIndex(org => org.id === orgId)
        if (index !== -1) {
          mockOrganizations.splice(index, 1)
        }
        resolve({
          data: { success: true }
        })
      }, 300)
    })
  }
} 