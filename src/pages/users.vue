<template>
    <!-- 标题 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">用户管理</h1>
      </v-col>
    </v-row>

    <!-- 搜索和筛选区域 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="8" md="6">
        <v-text-field
          v-model="searchQuery"
          label="搜索用户名"
          append-inner-icon="mdi-magnify"
          clearable
          density="compact"
          hide-details
          class="search-input"
          @keyup.enter="handleSearch"
          @click:append-inner="handleSearch"
          @click:clear="handleSearch"
          placeholder="请输入用户名"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4" md="6" class="d-flex justify-end">
        <v-btn 
          color="primary" 
          class="text-none mr-2" 
          prepend-icon="mdi-filter-variant"
          @click="showFilterDialog = true"
        >
          筛选
        </v-btn>
        <v-btn
          v-if="currentUser && currentUser.email === 'admin@mail.com'"
          color="success"
          class="text-none"
          prepend-icon="mdi-account-plus"
          @click="showCreateAdminDialog = true"
        >
          创建管理员
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="users"
        class="elevation-0"
        :items-per-page="pageSize"
        hover
        :width="'100%'"
        :loading="loading"
        hide-default-footer
      >
        <template v-slot:top>
          <div class="d-flex align-center pa-4">
            <div class="text-caption text-medium-emphasis">
              共 {{ totalUsers }} 条记录
            </div>
          </div>
        </template>
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="40">
            <v-img :src="item.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'" :alt="item.username"></v-img>
          </v-avatar>
        </template>

        <template v-slot:item.email="{ item }">
          <span>{{ item.email }}</span>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip
            v-if="item.email === ROOT_ADMIN_EMAIL"
            color="purple"
            size="small"
            class="role-chip"
          >
            根管理员
          </v-chip>
          <v-chip
            v-else
            :color="getRoleColor(item.role)"
            size="small"
            class="role-chip"
          >
            {{ getRoleName(item.role) }}
          </v-chip>
        </template>

        <template v-slot:item.permission="{ item }">
          <div class="d-flex flex-column align-center">
            <v-chip
              v-if="item.role === 'admin'"
              size="x-small"
              color="error"
              class="mb-1"
            >
              管理员权限
            </v-chip>
            <template v-else>
              <div class="d-flex flex-wrap justify-center gap-2">
                <div class="d-flex align-center">
                  <v-icon
                    :color="getPermissionBit(item.permission, 3) ? 'info' : 'error'"
                    size="small"
                    class="mr-1"
                  >
                    {{ getPermissionBit(item.permission, 3) ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <span class="text-caption">上传图像</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    :color="getPermissionBit(item.permission, 2) ? 'success' : 'error'"
                    size="small"
                    class="mr-1"
                  >
                    {{ getPermissionBit(item.permission, 2) ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <span class="text-caption">提交AI检测</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    :color="getPermissionBit(item.permission, 1) ? 'warning' : 'error'"
                    size="small"
                    class="mr-1"
                  >
                    {{ getPermissionBit(item.permission, 1) ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <span class="text-caption">发布人工审核</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    :color="getPermissionBit(item.permission, 0) ? 'primary' : 'error'"
                    size="small"
                    class="mr-1"
                  >
                    {{ getPermissionBit(item.permission, 0) ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <span class="text-caption">提交人工审核</span>
                </div>
              </div>
            </template>
          </div>
        </template>

        <template v-slot:item.registerTime="{ item }">
          {{ formatTime(item.registerTime) }}
        </template>

        <template v-slot:item.lastLoginTime="{ item }">
          {{ formatTime(item.lastLoginTime) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            class="mr-2"
            @click="openPermissionDialog(item)"
          >
            <v-icon>mdi-key-variant</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="error"
            @click="openDeleteDialog(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
      
      <div class="d-flex align-center justify-center pa-4">
        <div class="d-flex align-center">
          <span class="text-caption mr-2">每页显示</span>
          <v-select
            v-model="pageSize"
            :items="[5, 10, 20, 50, 100]"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 100px"
            @update:model-value="handlePageSizeChange"
          ></v-select>
          <span class="text-caption ml-2">条</span>
        </div>
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          class="ml-4"
          @update:model-value="handlePageChange"
        ></v-pagination>
      </div>
    </v-card>

    <!-- 权限设置对话框 -->
    <v-dialog v-model="showPermissionDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">修改权限</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-switch
              v-model="editingPermissions.uploadImage"
              label="上传图像权限"
              color="info"
              hide-details
            ></v-switch>
            <v-switch
              v-model="editingPermissions.submitAI"
              label="提交AI检测权限"
              color="success"
              hide-details
            ></v-switch>
            <v-switch
              v-model="editingPermissions.publishReview"
              label="发布人工审核权限"
              color="warning"
              hide-details
            ></v-switch>
            <v-switch
              v-model="editingPermissions.submitReview"
              label="提交人工审核权限"
              color="primary"
              hide-details
            ></v-switch>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showPermissionDialog = false">取消</v-btn>
          <v-btn color="primary" @click="updatePermissions">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">确认删除</v-card-title>
        <v-card-text>
          确定要删除用户 "{{ selectedUser?.username }}" 吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">取消</v-btn>
          <v-btn color="error" @click="deleteUser">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 筛选对话框 -->
    <v-dialog v-model="showFilterDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">筛选条件</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-select
              v-model="filters.role"
              :items="roleOptions"
              label="角色"
              clearable
              hide-details
            ></v-select>
            
            <div class="d-flex flex-column gap-2">
              <div class="text-subtitle-2">权限筛选</div>
              <v-switch
                v-model="filters.permissions.uploadImage"
                label="上传图像权限"
                color="info"
                hide-details
              ></v-switch>
              <v-switch
                v-model="filters.permissions.submitAI"
                label="提交AI检测权限"
                color="success"
                hide-details
              ></v-switch>
              <v-switch
                v-model="filters.permissions.publishReview"
                label="发布人工审核权限"
                color="warning"
                hide-details
              ></v-switch>
              <v-switch
                v-model="filters.permissions.submitReview"
                label="提交人工审核权限"
                color="primary"
                hide-details
              ></v-switch>
            </div>
            
            <v-select
              v-model="filters.timeRange"
              :items="timeRangeOptions"
              label="快速选择时间范围"
              clearable
              hide-details
              @update:model-value="handleTimeRangeChange"
            ></v-select>

            <div class="d-flex align-center gap-4">
              <v-text-field
                v-model="filters.startDate"
                label="开始时间"
                type="datetime-local"
                hide-details
                density="compact"
                :error-messages="timeError"
                @update:model-value="handleCustomTimeChange"
              ></v-text-field>
              <v-text-field
                v-model="filters.endDate"
                label="结束时间"
                type="datetime-local"
                hide-details
                density="compact"
                :error-messages="timeError"
                @update:model-value="handleCustomTimeChange"
              ></v-text-field>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="resetFilters">重置</v-btn>
          <v-btn color="primary" @click="applyFilters">应用</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 创建管理员对话框 -->
    <v-dialog
      v-if="currentUser && currentUser.email === 'admin@mail.com'"
      v-model="showCreateAdminDialog"
      max-width="500"
    >
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">创建管理员</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-text-field
              v-model="newAdmin.username"
              label="用户名"
              :rules="[v => !!v || '用户名不能为空']"
              required
            ></v-text-field>
            <v-text-field
              v-model="newAdmin.email"
              label="邮箱"
              :rules="[v => !!v || '邮箱不能为空', v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址']"
              required
            ></v-text-field>
            <v-text-field
              v-model="newAdmin.password"
              label="密码"
              type="password"
              :rules="[v => !!v || '密码不能为空', v => v.length >= 6 || '密码长度不能少于6位']"
              required
            ></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showCreateAdminDialog = false">取消</v-btn>
          <v-btn color="success" @click="createAdmin" :loading="creatingAdmin">创建</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import userApi from '@/api/user'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()

interface User {
  id: number
  avatar: string
  username: string
  email: string
  role: string
  permission: number
  registerTime: number
  lastLoginTime: number
}

const headers = [
  { title: '头像', key: 'avatar', align: 'center', sortable: false },
  { title: '用户名', key: 'username', align: 'start' },
  { title: '邮箱', key: 'email', align: 'start' },
  { title: '角色', key: 'role', align: 'center' },
  { title: '权限', key: 'permission', align: 'center', sortable: false },
  { title: '注册时间', key: 'registerTime', align: 'center' },
  { title: '最后登录', key: 'lastLoginTime', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
] as const

// 分页相关
const users = ref<User[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)
const totalPages = ref(1)

// 权限编辑相关
const showPermissionDialog = ref(false)
const selectedUser = ref<User | null>(null)
const editingPermissions = ref({
  uploadImage: false,
  submitAI: false,
  publishReview: false,
  submitReview: false
})

// 删除对话框相关
const showDeleteDialog = ref(false)

// 搜索相关
const searchQuery = ref('')
const selectedHeader = ref<typeof headers[0] | null>(null)

// 可搜索的列
const searchableHeaders = computed(() => {
  return headers.filter(header => 
    header.key !== 'avatar' && 
    header.key !== 'permission' && 
    header.key !== 'actions'
  )
})

const selectHeader = (header: typeof headers[0]) => {
  selectedHeader.value = header
  searchQuery.value = ''
}

const handleSearch = () => {
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(1, 10)
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const openPermissionDialog = (user: User) => {
  selectedUser.value = user
  if (user.role !== 'admin' && user.email !== ROOT_ADMIN_EMAIL) {
    editingPermissions.value = {
      uploadImage: getPermissionBit(user.permission, 3),
      submitAI: getPermissionBit(user.permission, 2),
      publishReview: getPermissionBit(user.permission, 1),
      submitReview: getPermissionBit(user.permission, 0)
    }
  }
  showPermissionDialog.value = true
}

const updatePermissions = async () => {
  if (selectedUser.value && selectedUser.value.role !== 'admin' && selectedUser.value.email !== ROOT_ADMIN_EMAIL) {
    try {
      // 计算权限值
      const permissionValue = 
        (editingPermissions.value.uploadImage ? 8 : 0) +
        (editingPermissions.value.submitAI ? 4 : 0) +
        (editingPermissions.value.publishReview ? 2 : 0) +
        (editingPermissions.value.submitReview ? 1 : 0)

      await userApi.updateUserPermission(selectedUser.value.id, permissionValue.toString())
      
      // 更新本地数据
      const userToUpdate = users.value.find(u => u.id === selectedUser.value!.id)
      if (userToUpdate) {
        userToUpdate.permission = permissionValue
      }
      
      snackbar.showMessage('权限更新成功', 'success')
    } catch (error) {
      console.error('更新权限失败:', error)
      snackbar.showMessage('更新权限失败', 'error')
    }
  }
  showPermissionDialog.value = false
}

const openDeleteDialog = (user: User) => {
  selectedUser.value = user
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  if (selectedUser.value) {
    try {
      await userApi.deleteUser(selectedUser.value.id)
      users.value = users.value.filter(u => u.id !== selectedUser.value!.id)
      snackbar.showMessage('用户删除成功', 'success')
    } catch (error) {
      console.error('删除用户失败:', error)
      snackbar.showMessage('删除用户失败', 'error')
    }
  }
  showDeleteDialog.value = false
}

// 筛选相关
const showFilterDialog = ref(false)
const filters = ref<{
  role: string | null
  permissions: {
    uploadImage: boolean | null
    submitAI: boolean | null
    publishReview: boolean | null
    submitReview: boolean | null
  }
  timeRange: string | null
  startDate: string | null
  endDate: string | null
}>({
  role: null,
  permissions: {
    uploadImage: null,
    submitAI: null,
    publishReview: null,
    submitReview: null
  },
  timeRange: null,
  startDate: null,
  endDate: null
})

const roleOptions = [
  { title: '出版社', value: 'publisher' },
  { title: '审稿人', value: 'reviewer' },
  { title: '管理员', value: 'admin' }
]

const timeRangeOptions = [
  { title: '最近一天', value: '1d' },
  { title: '最近一周', value: '7d' },
  { title: '最近一月', value: '30d' },
  { title: '最近三月', value: '90d' },
  { title: '最近一年', value: '365d' }
]

// 保存原始数据用于重置
const originalUsers = ref<User[]>([])

// 初始化时保存原始数据
const initOriginalUsers = () => {
  originalUsers.value = [...users.value]
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    role: null,
    permissions: {
      uploadImage: null,
      submitAI: null,
      publishReview: null,
      submitReview: null
    },
    timeRange: null,
    startDate: null,
    endDate: null
  }
  timeError.value = ''
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(1, 10)
  showFilterDialog.value = false
}

// 应用筛选条件
const applyFilters = () => {
  // 如果有时间错误，不执行筛选
  if (timeError.value) {
    return
  }
  
  // 计算权限值
  let permissionValue = 0
  if (filters.value.permissions.uploadImage !== null) {
    permissionValue |= (filters.value.permissions.uploadImage ? 8 : 0)
  }
  if (filters.value.permissions.submitAI !== null) {
    permissionValue |= (filters.value.permissions.submitAI ? 4 : 0)
  }
  if (filters.value.permissions.publishReview !== null) {
    permissionValue |= (filters.value.permissions.publishReview ? 2 : 0)
  }
  if (filters.value.permissions.submitReview !== null) {
    permissionValue |= (filters.value.permissions.submitReview ? 1 : 0)
  }
  
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(1, 10)
  showFilterDialog.value = false
}

// 在 script 部分添加时间验证相关的代码
const timeError = ref('')

// 处理快速选择时间范围变化
const handleTimeRangeChange = (value: string | null) => {
  if (value) {
    // 如果选择了快速时间范围，清空自定义时间
    filters.value.startDate = null
    filters.value.endDate = null
    timeError.value = ''
  }
}

// 处理自定义时间变化
const handleCustomTimeChange = () => {
  // 如果输入了自定义时间，清空快速选择
  filters.value.timeRange = null
  
  // 验证时间
  if (!filters.value.startDate || !filters.value.endDate) {
    timeError.value = '开始时间和结束时间不能为空'
    return
  }

  const startTime = new Date(filters.value.startDate).getTime()
  const endTime = new Date(filters.value.endDate).getTime()
  
  if (startTime >= endTime) {
    timeError.value = '开始时间必须早于结束时间'
  } else {
    timeError.value = ''
  }
}


const getRoleColor = (role: string) => {
  switch (role) {
    case 'publisher':
      return 'success'
    case 'reviewer':
      return 'primary'
    case 'admin':
      return 'error'
    default:
      return 'grey'
  }
}

const getRoleName = (role: string) => {
  switch (role) {
    case 'publisher':
      return '出版社'
    case 'reviewer':
      return '审稿人'
    case 'admin':
      return '管理员'
    default:
      return role
  }
}

const getPermissionBit = (permission: number | null, bit: number) => {
  if (permission === null) return false
  return ((permission >> bit) & 1) === 1
}

// 创建管理员相关
const showCreateAdminDialog = ref(false)
const creatingAdmin = ref(false)
const newAdmin = ref({
  username: '',
  email: '',
  password: '',
  role: 'admin'
})

// 从后端获取用户数据
const fetchUsers = async (page: number, pageSize: number) => {
  loading.value = true
  try {
    // 计算权限筛选值（4 位二进制）
    let permissionFilter = ''
    const { uploadImage, submitAI, publishReview, submitReview } = filters.value.permissions
    if (uploadImage !== null || submitAI !== null || publishReview !== null || submitReview !== null) {
      let value = 0
      if (uploadImage !== null) { value |= (uploadImage ? 8 : 0) }
      if (submitAI !== null) { value |= (submitAI ? 4 : 0) }
      if (publishReview !== null) { value |= (publishReview ? 2 : 0) }
      if (submitReview !== null) { value |= (submitReview ? 1 : 0) }
      permissionFilter = value.toString()
    }

    // 计算时间筛选
    let startTimeFilter: string | undefined
    let endTimeFilter: string | undefined
    if (filters.value.timeRange) {
      const now = Date.now()
      const ranges: Record<string, number> = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '365d': 365 * 24 * 60 * 60 * 1000
      }
      const rangeMs = ranges[filters.value.timeRange as keyof typeof ranges]
      startTimeFilter = formatDateFilter(now - rangeMs)
      endTimeFilter = formatDateFilter(now)
    } else if (filters.value.startDate && filters.value.endDate) {
      startTimeFilter = formatDateFilter(new Date(filters.value.startDate).getTime())
      endTimeFilter = formatDateFilter(new Date(filters.value.endDate).getTime())
    }

    const params = {
      page,
      page_size: pageSize,
      query: searchQuery.value || '',
      role: filters.value.role || '',
      permission: permissionFilter,
      startTime: startTimeFilter,
      endTime: endTimeFilter
    }
    const response = await userApi.getUsers(params)
    const { users: userList, current_page, total_pages, total_users } = response.data
    
    // 转换后端数据格式为前端格式
    users.value = userList.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permission: user.permission,
      registerTime: new Date(user.date_joined).getTime(),
      lastLoginTime: new Date(user.date_joined).getTime(),
      avatar: 'http://122.9.45.122/media/'+user.avatar || ''
    }))
    
    currentPage.value = current_page
    totalPages.value = total_pages
    totalUsers.value = total_users
    
    // 保存原始数据用于筛选
    originalUsers.value = [...users.value]
  } catch (error) {
    console.error('获取用户数据失败:', error)
    snackbar.showMessage('获取用户数据失败', 'error')
  } finally {
    loading.value = false
  }
}

// 创建管理员
const createAdmin = async () => {
  if (!newAdmin.value.username || !newAdmin.value.email || !newAdmin.value.password) {
    snackbar.showMessage('请填写完整信息', 'error')
    return
  }

  creatingAdmin.value = true
  try {
    const response = await userApi.createAdmin(newAdmin.value)
    snackbar.showMessage('管理员创建成功', 'success')
    showCreateAdminDialog.value = false
    // 刷新用户列表
    fetchUsers(currentPage.value, pageSize.value)
    // 重置表单
    newAdmin.value = {
      username: '',
      email: '',
      password: '',
      role: 'admin'
    }
  } catch (error) {
    console.error('创建管理员失败:', error)
    snackbar.showMessage('创建管理员失败', 'error')
  } finally {
    creatingAdmin.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers(page, pageSize.value)
}

// 处理每页数量变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  fetchUsers(1, size)
}

// 当前用户
const currentUser = ref<{ email: string } | null>(null)

// 初始化
onMounted(async () => {
  try {
    const res = await userApi.getUserInfo()
    currentUser.value = res.data
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
  fetchUsers(currentPage.value, pageSize.value)
})

const ROOT_ADMIN_EMAIL = 'admin@mail.com'

// 时间格式化，用于筛选条件
const formatDateFilter = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  overflow: hidden;
}

.role-chip {
  font-size: 12px;
  padding: 0 12px;
  font-weight: 500;
}

.v-btn.v-btn--size-small {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
}

.v-btn--icon.v-btn--size-small .v-icon {
  font-size: 18px;
}

:deep(.v-data-table) {
  border-radius: 12px;
  width: 100%;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

:deep(.v-data-table__tr td) {
  white-space: nowrap;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

:deep(.v-chip) {
  font-weight: 500;
}

.search-input {
  max-width: 400px;
}

:deep(.v-text-field .v-field__input) {
  min-height: 40px;
}

:deep(.v-btn--variant-outlined) {
  border-color: rgb(var(--v-theme-outline));
}

:deep(.v-select .v-field__input) {
  min-height: 40px;
}

:deep(.v-select .v-field__append-inner) {
  padding-top: 0;
}
</style>
