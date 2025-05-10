<template>
  <v-container>
    <!-- 标题 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">用户管理</h1>
      </v-col>
    </v-row>

    <!-- 组织选择和搜索区域 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="8" md="6">
        <v-autocomplete
          v-model="selectedOrg"
          :items="orgList"
          :loading="loadingOrgs"
          item-title="name"
          item-value="id"
          label="选择组织"
          prepend-icon="mdi-office-building"
          return-object
          clearable
          hide-details
          @update:model-value="handleOrgChange"
        >
          <template v-slot:selection="{ item }">
            <v-chip class="ma-1">
              {{ item.raw.name }}
              <v-avatar start size="24" class="mr-2">
                <v-img :src="getImageUrl(item.raw.logo)" cover></v-img>
              </v-avatar>
            </v-chip>
          </template>
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.description">
              <template v-slot:prepend>
                <v-avatar size="24" class="mr-2">
                  <v-img :src="getImageUrl(item.raw.logo)" cover></v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
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

    <!-- 统计卡片 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="large" class="mr-3">mdi-account-group</v-icon>
              <div>
                <div class="text-h6">{{ stats.totalUsers }}</div>
                <div class="text-caption">总用户数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="large" class="mr-3">mdi-account-tie</v-icon>
              <div>
                <div class="text-h6">{{ stats.publisherUsers }}</div>
                <div class="text-caption">主席用户数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="large" class="mr-3">mdi-account-edit</v-icon>
              <div>
                <div class="text-h6">{{ stats.reviewerUsers }}</div>
                <div class="text-caption">编辑用户数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
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

        <template v-slot:item.organization="{ item }">
          <v-chip
            v-if="item.organization_name"
            color="info"
            size="small"
            class="organization-chip"
          >
            {{ item.organization_name }}
          </v-chip>
          <span v-else class="text-caption text-medium-emphasis">未分配</span>
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
              v-if="item.role === 'admin'||item.email === ROOT_ADMIN_EMAIL"
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

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="info"
            class="mr-2"
            @click="openUserDetailsDialog(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
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
            <!-- 出版社权限 -->
            <template v-if="selectedUser?.role === 'publisher'">
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
            </template>
            <!-- 审稿人权限 -->
            <template v-else-if="selectedUser?.role === 'reviewer'">
              <v-switch
                v-model="editingPermissions.submitReview"
                label="提交人工审核权限"
                color="primary"
                hide-details
              ></v-switch>
            </template>
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

    <!-- 用户详情对话框 -->
    <v-dialog v-model="showUserDetailsDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">用户详情</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <div class="d-flex justify-center">
              <v-avatar size="120">
                <v-img :src="selectedUserDetails?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'" :alt="selectedUserDetails?.username"></v-img>
              </v-avatar>
            </div>
            <v-divider></v-divider>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-account</v-icon>
                <span class="text-subtitle-1">用户名：</span>
                <span class="text-body-1 ml-2">{{ selectedUserDetails?.username }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-email</v-icon>
                <span class="text-subtitle-1">邮箱：</span>
                <span class="text-body-1 ml-2">{{ selectedUserDetails?.email }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-office-building</v-icon>
                <span class="text-subtitle-1">所属组织：</span>
                <span class="text-body-1 ml-2">{{ selectedUserDetails?.organization_name || '未分配' }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-account-cog</v-icon>
                <span class="text-subtitle-1">角色：</span>
                <v-chip
                  :color="getRoleColor(selectedUserDetails?.role || '')"
                  size="small"
                  class="ml-2"
                >
                  {{ getRoleName(selectedUserDetails?.role || '') }}
                </v-chip>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-text</v-icon>
                <span class="text-subtitle-1">简介：</span>
                <span class="text-body-1 ml-2">{{ selectedUserDetails?.profile || '暂无简介' }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showUserDetailsDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { mockApi } from '@/mock/users-adm'

const snackbar = useSnackbarStore()

interface Organization {
  id: number
  name: string
  description: string
  logo: string
}

interface User {
  id: number
  avatar: string
  username: string
  email: string
  role: string
  permission: string
  registerTime: number
  lastLoginTime: number
  organization_id: number | null
  organization_name: string | null
}

interface UserStats {
  totalUsers: number
  publisherUsers: number
  reviewerUsers: number
  adminUsers: number
}

const headers = [
  { title: '头像', key: 'avatar', align: 'center', sortable: false },
  { title: '用户名', key: 'username', align: 'start' },
  { title: '邮箱', key: 'email', align: 'start' },
  { title: '所属组织', key: 'organization', align: 'center' },
  { title: '角色', key: 'role', align: 'center' },
  { title: '权限', key: 'permission', align: 'center', sortable: false },
  { title: '注册时间', key: 'registerTime', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
] as const

// 组织相关
const orgList = ref<Organization[]>([])
const loadingOrgs = ref(false)
const selectedOrg = ref<Organization | null>(null)

// 统计信息
const stats = ref<UserStats>({
  totalUsers: 0,
  publisherUsers: 0,
  reviewerUsers: 0,
  adminUsers: 0
})

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
}>({
  role: null,
  permissions: {
    uploadImage: null,
    submitAI: null,
    publishReview: null,
    submitReview: null
  }
})

const roleOptions = [
  { title: '主席', value: 'publisher' },
  { title: '编辑', value: 'reviewer' },
  { title: '管理员', value: 'admin' }
]

// 处理组织变化
const handleOrgChange = () => {
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(1, 10)
  fetchStats()
}

// 获取组织列表
const fetchOrgs = async () => {
  loadingOrgs.value = true
  try {
    const response = await mockApi.getOrganizations()
    orgList.value = response.data.organizations
  } catch (error) {
    console.error('获取组织列表失败:', error)
    snackbar.showMessage('获取组织列表失败', 'error')
  } finally {
    loadingOrgs.value = false
  }
}

// 获取统计信息
const fetchStats = async () => {
  try {
    const response = await mockApi.getUsers({
      organization_id: selectedOrg.value?.id
    })
    const userList = response.data.users
    
    stats.value = {
      totalUsers: userList.length,
      publisherUsers: userList.filter(user => user.role === 'publisher').length,
      reviewerUsers: userList.filter(user => user.role === 'reviewer').length,
      adminUsers: userList.filter(user => user.role === 'admin').length
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    snackbar.showMessage('获取统计信息失败', 'error')
  }
}

// 从后端获取用户数据
const fetchUsers = async (page: number, pageSize: number) => {
  loading.value = true
  try {
    const params = {
      page,
      page_size: pageSize,
      organization_id: selectedOrg.value?.id,
      role: filters.value.role || ''
    }
    
    const response = await mockApi.getUsers(params)
    const { users: userList, current_page, total_pages, total_users } = response.data
    
    users.value = userList
    currentPage.value = current_page
    totalPages.value = total_pages
    totalUsers.value = total_users
  } catch (error) {
    console.error('获取用户数据失败:', error)
    snackbar.showMessage('获取用户数据失败', 'error')
  } finally {
    loading.value = false
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
  currentPage.value = 1
  fetchUsers(1, size)
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
  // 只有非管理员和非根管理员才能修改权限
  if (user.role !== 'admin' && user.email !== ROOT_ADMIN_EMAIL) {
    editingPermissions.value = {
      uploadImage: getPermissionBit(user.permission, 3),
      submitAI: getPermissionBit(user.permission, 2),
      publishReview: getPermissionBit(user.permission, 1),
      submitReview: getPermissionBit(user.permission, 0)
    }
    showPermissionDialog.value = true
  } else {
    snackbar.showMessage('不能修改管理员权限', 'warning')
  }
}

const updatePermissions = async () => {
  if (selectedUser.value && selectedUser.value.role !== 'admin' && selectedUser.value.email !== ROOT_ADMIN_EMAIL) {
    try {
      // 计算权限值（4位二进制）
      const permissionValue = 
        (editingPermissions.value.uploadImage ? 8 : 0) +  // 第3位：上传图像
        (editingPermissions.value.submitAI ? 4 : 0) +     // 第2位：提交AI检测
        (editingPermissions.value.publishReview ? 2 : 0) + // 第1位：发布人工审核
        (editingPermissions.value.submitReview ? 1 : 0)    // 第0位：提交人工审核

      // 转换为4位二进制字符串
      const permissionBinary = permissionValue.toString(2).padStart(4, '0')
      await mockApi.updateUserPermission(selectedUser.value.id, permissionBinary)
      
      // 更新本地数据
      const userToUpdate = users.value.find(u => u.id === selectedUser.value!.id)
      if (userToUpdate) {
        userToUpdate.permission = permissionBinary
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
  // 根管理员不能被删除
  if (user.email === ROOT_ADMIN_EMAIL) {
    snackbar.showMessage('不能删除根管理员', 'warning')
    return
  }
  selectedUser.value = user
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  if (selectedUser.value) {
    try {
      await mockApi.deleteUser(selectedUser.value.id)
      users.value = users.value.filter(u => u.id !== selectedUser.value!.id)
      snackbar.showMessage('用户删除成功', 'success')
    } catch (error) {
      console.error('删除用户失败:', error)
      snackbar.showMessage('删除用户失败', 'error')
    }
  }
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(currentPage.value, pageSize.value)
  showDeleteDialog.value = false
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
    }
  }
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(1, 10)
  showFilterDialog.value = false
}

// 应用筛选条件
const applyFilters = () => {
  currentPage.value = 1
  pageSize.value = 10
  fetchUsers(1, 10)
  showFilterDialog.value = false
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
      return '主席'
    case 'reviewer':
      return '编辑'
    case 'admin':
      return '管理员'
    default:
      return role
  }
}

const getPermissionBit = (permission: string | null, bit: number) => {
  if (permission === null) return false
  // 将二进制字符串转换为数字，然后进行位运算
  const permissionNum = parseInt(permission, 2)
  return ((permissionNum >> bit) & 1) === 1
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

// 创建管理员
const createAdmin = async () => {
  if (!newAdmin.value.username || !newAdmin.value.email || !newAdmin.value.password) {
    snackbar.showMessage('请填写完整信息', 'error')
    return
  }

  creatingAdmin.value = true
  try {
    await mockApi.createAdmin(newAdmin.value)
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

// 当前用户
const currentUser = ref<{ email: string } | null>(null)

// 初始化
onMounted(async () => {
  try {
    const res = await mockApi.getUserInfo(1) // 模拟获取当前用户信息
    currentUser.value = res.data
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
  fetchOrgs()
  fetchUsers(currentPage.value, pageSize.value)
})

const ROOT_ADMIN_EMAIL = 'admin@mail.com'

// 用户详情相关
const showUserDetailsDialog = ref(false)
const selectedUserDetails = ref<{
  username: string
  email: string
  role: string
  profile: string
  avatar: string
  organization_name: string | null
} | null>(null)

// 打开用户详情对话框
const openUserDetailsDialog = async (user: User) => {
  // 检查权限
  if (user.role === 'admin' && currentUser.value?.email !== ROOT_ADMIN_EMAIL) {
    snackbar.showMessage('只有根管理员才能查看管理员信息', 'warning')
    return
  }

  try {
    const response = await mockApi.getUserInfo(user.id)
    selectedUserDetails.value = {
      ...response.data,
      avatar: 'http://122.9.45.122' + response.data.avatar
    }
    showUserDetailsDialog.value = true
  } catch (error) {
    console.error('获取用户详情失败:', error)
    snackbar.showMessage('获取用户详情失败', 'error')
  }
}

const getImageUrl = (url: string) => {
  return import.meta.env.VITE_API_URL + url
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.role-chip {
  font-size: 12px;
  padding: 0 12px;
  font-weight: 500;
}

.organization-chip {
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

:deep(.v-text-field .v-field__input) {
  min-height: 40px;
}

:deep(.v-select .v-field__input) {
  min-height: 40px;
}

:deep(.v-select .v-field__append-inner) {
  padding-top: 0;
}
</style>
