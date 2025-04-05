<template>
  <v-container>
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
          density="compact"
          hide-details
          class="search-input"
          @keyup.enter="handleSearch"
          @click:append-inner="handleSearch"
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
      </v-col>
    </v-row>

    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="users"
        class="elevation-0"
        :items-per-page="10"
        hover
        :width="'100%'"
      >
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="40">
            <v-img :src="item.avatar" :alt="item.username"></v-img>
          </v-avatar>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip
            :color="item.role === '出版社' ? 'success' : 'primary'"
            size="small"
            class="role-chip"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <template v-slot:item.permissions="{ item }">
          <div class="d-flex flex-column align-center">
            <v-chip
              size="x-small"
              :color="item.permissions.canPublish ? 'success' : 'error'"
              class="mb-1"
            >
              {{ item.permissions.canPublish ? '可发布审核' : '禁止发布' }}
            </v-chip>
            <v-chip
              size="x-small"
              :color="item.permissions.canSubmit ? 'success' : 'error'"
            >
              {{ item.permissions.canSubmit ? '可提交检测' : '禁止提交' }}
            </v-chip>
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
    </v-card>

    <!-- 权限设置对话框 -->
    <v-dialog v-model="showPermissionDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">修改权限</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-switch
              v-model="editingPermissions.canPublish"
              label="发布审核权限"
              color="success"
              hide-details
            ></v-switch>
            <v-switch
              v-model="editingPermissions.canSubmit"
              label="提交检测权限"
              color="success"
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
            
            <v-select
              v-model="filters.canPublish"
              :items="permissionOptions"
              label="发布权限"
              clearable
              hide-details
            ></v-select>
            
            <v-select
              v-model="filters.canSubmit"
              :items="submitOptions"
              label="提交权限"
              clearable
              hide-details
            ></v-select>
            
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  avatar: string
  username: string
  role: string
  permissions: {
    canPublish: boolean
    canSubmit: boolean
  }
  registerTime: number
  lastLoginTime: number
}

const headers = [
  { title: '头像', key: 'avatar', align: 'center', sortable: false },
  { title: '用户名', key: 'username', align: 'start' },
  { title: '角色', key: 'role', align: 'center' },
  { title: '权限', key: 'permissions', align: 'center', sortable: false },
  { title: '注册时间', key: 'registerTime', align: 'center' },
  { title: '最后登录', key: 'lastLoginTime', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
] as const

const users = ref<User[]>([
  {
    id: 1,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    username: 'JCLR 2021',
    role: '出版社',
    permissions: {
      canPublish: true,
      canSubmit: true
    },
    registerTime: Date.now(),
    lastLoginTime: Date.now() - 24 * 60 * 60 * 1000
  },
  {
    id: 2,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    username: '审稿人A',
    role: '审稿人',
    permissions: {
      canPublish: false,
      canSubmit: true
    },
    registerTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 3,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    username: '出版社B',
    role: '出版社',
    permissions: {
      canPublish: true,
      canSubmit: false
    },
    registerTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 12 * 60 * 60 * 1000
  },
  {
    id: 4,
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    username: '审稿人B',
    role: '审稿人',
    permissions: {
      canPublish: false,
      canSubmit: true
    },
    registerTime: Date.now() - 90 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: 5,
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    username: '出版社C',
    role: '出版社',
    permissions: {
      canPublish: true,
      canSubmit: true
    },
    registerTime: Date.now() - 180 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: 6,
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    username: '审稿人C',
    role: '审稿人',
    permissions: {
      canPublish: false,
      canSubmit: false
    },
    registerTime: Date.now() - 365 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 30 * 24 * 60 * 60 * 1000
  },
  {
    id: 7,
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    username: '出版社D',
    role: '出版社',
    permissions: {
      canPublish: true,
      canSubmit: true
    },
    registerTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 1 * 60 * 60 * 1000
  },
  {
    id: 8,
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    username: '审稿人D',
    role: '审稿人',
    permissions: {
      canPublish: false,
      canSubmit: true
    },
    registerTime: Date.now() - 15 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 9,
    avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
    username: '出版社E',
    role: '出版社',
    permissions: {
      canPublish: true,
      canSubmit: false
    },
    registerTime: Date.now() - 60 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 6 * 24 * 60 * 60 * 1000
  },
  {
    id: 10,
    avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
    username: '审稿人F',
    role: '审稿人',
    permissions: {
      canPublish: false,
      canSubmit: true
    },
    registerTime: Date.now() - 120 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 10 * 24 * 60 * 60 * 1000
  }
])

// 权限编辑相关
const showPermissionDialog = ref(false)
const selectedUser = ref<User | null>(null)
const editingPermissions = ref<{ canPublish: boolean, canSubmit: boolean }>({
  canPublish: false,
  canSubmit: false
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
    header.key !== 'permissions' && 
    header.key !== 'actions'
  )
})

const selectHeader = (header: typeof headers[0]) => {
  selectedHeader.value = header
  searchQuery.value = ''
}

const handleSearch = () => {
  if (!searchQuery.value) {
    users.value = [...originalUsers.value]
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  users.value = originalUsers.value.filter(user => 
    user.username.toLowerCase().includes(query)
  )
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
  editingPermissions.value = { ...user.permissions }
  showPermissionDialog.value = true
}

const updatePermissions = () => {
  if (selectedUser.value) {
    const userToUpdate = users.value.find(u => u.id === selectedUser.value!.id)
    if (userToUpdate) {
      userToUpdate.permissions = { ...editingPermissions.value }
    }
  }
  showPermissionDialog.value = false
}

const openDeleteDialog = (user: User) => {
  selectedUser.value = user
  showDeleteDialog.value = true
}

const deleteUser = () => {
  if (selectedUser.value) {
    users.value = users.value.filter(u => u.id !== selectedUser.value!.id)
  }
  showDeleteDialog.value = false
}

// 筛选相关
const showFilterDialog = ref(false)
const filters = ref<{
  role: string | null
  canPublish: boolean | null
  canSubmit: boolean | null
  timeRange: string | null
  startDate: string | null
  endDate: string | null
}>({
  role: null,
  canPublish: null,
  canSubmit: null,
  timeRange: null,
  startDate: null,
  endDate: null
})

const roleOptions = [
  { title: '出版社', value: '出版社' },
  { title: '审稿人', value: '审稿人' }
]

const permissionOptions = [
  { title: '可发布审核', value: true },
  { title: '禁止发布', value: false }
]

const submitOptions = [
  { title: '可提交检测', value: true },
  { title: '禁止提交', value: false }
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
    canPublish: null,
    canSubmit: null,
    timeRange: null,
    startDate: null,
    endDate: null
  }
  timeError.value = ''
  users.value = [...originalUsers.value]
  showFilterDialog.value = false
}

// 应用筛选条件
const applyFilters = () => {
  // 如果有时间错误，不执行筛选
  if (timeError.value) {
    return
  }
  
  let filteredUsers = [...originalUsers.value]
  
  // 角色筛选
  if (filters.value.role) {
    filteredUsers = filteredUsers.filter(user => user.role === filters.value.role)
  }
  
  // 发布权限筛选
  if (filters.value.canPublish !== null) {
    filteredUsers = filteredUsers.filter(user => user.permissions.canPublish === filters.value.canPublish)
  }
  
  // 提交权限筛选
  if (filters.value.canSubmit !== null) {
    filteredUsers = filteredUsers.filter(user => user.permissions.canSubmit === filters.value.canSubmit)
  }
  
  // 时间范围筛选
  if (filters.value.timeRange) {
    const now = Date.now()
    const ranges = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '365d': 365 * 24 * 60 * 60 * 1000
    }
    const range = ranges[filters.value.timeRange as keyof typeof ranges]
    filteredUsers = filteredUsers.filter(user => (now - user.registerTime) <= range)
  } else if (filters.value.startDate && filters.value.endDate) {
    const startTime = new Date(filters.value.startDate).getTime()
    const endTime = new Date(filters.value.endDate).getTime()
    filteredUsers = filteredUsers.filter(user => 
      user.registerTime >= startTime && user.registerTime <= endTime
    )
  }
  
  users.value = filteredUsers
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

// 初始化
initOriginalUsers()
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
