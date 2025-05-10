<template>
  <v-container>
    <!-- 标题 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">组织管理</h1>
      </v-col>
    </v-row>
    
    <!-- 操作栏 -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          color="primary"
          class="text-none mr-2"
          prepend-icon="mdi-filter-variant"
          @click="showFilterDialog = true"
        >
          筛选
        </v-btn>
        <v-btn
          color="success"
          class="text-none"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          创建组织
        </v-btn>
      </v-col>
    </v-row>

    <!-- 组织列表 -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="organizations"
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
              共 {{ totalOrgs }} 条记录
            </div>
          </div>
        </template>

        <template v-slot:item.logo="{ item }">
          <v-avatar size="40">
            <v-img :src="getImageUrl(item.logo)" :alt="item.name"></v-img>
          </v-avatar>
        </template>

        <template v-slot:item.userCount="{ item }">
          <v-chip
            color="info"
            size="small"
            class="user-count-chip"
          >
            {{ item.userCount }} 人
          </v-chip>
        </template>

        <template v-slot:item.fileCount="{ item }">
          <v-chip
            color="success"
            size="small"
            class="file-count-chip"
          >
            {{ item.fileCount }} 张
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="info"
            class="mr-2"
            @click="openDetailsDialog(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            class="mr-2"
            @click="openEditDialog(item)"
          >
            <v-icon>mdi-pencil</v-icon>
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

    <!-- 创建/编辑组织对话框 -->
    <v-dialog v-model="showOrgDialog" max-width="600">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">
          {{ isEditing ? '编辑组织' : '创建组织' }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-text-field
              v-model="editingOrg.name"
              label="组织名称"
              :rules="[v => !!v || '组织名称不能为空']"
              required
            ></v-text-field>
            <v-textarea
              v-model="editingOrg.description"
              label="组织描述"
              rows="3"
              :rules="[v => !!v || '组织描述不能为空']"
              required
            ></v-textarea>
            <v-file-input
              v-model="logoFile"
              label="组织Logo"
              accept="image/*"
              prepend-icon="mdi-camera"
              :rules="[v => !v || v.size < 2000000 || 'Logo大小不能超过2MB']"
              :show-size="1000"
            ></v-file-input>
            <div v-if="editingOrg.logo" class="d-flex justify-center">
              <v-avatar size="100">
                <v-img :src="getImageUrl(editingOrg.logo)" cover></v-img>
              </v-avatar>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showOrgDialog = false">取消</v-btn>
          <v-btn color="primary" @click="saveOrganization" :loading="saving">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">确认删除</v-card-title>
        <v-card-text>
          确定要删除组织 "{{ selectedOrg?.name }}" 吗？此操作不可撤销，且会同时删除该组织下的所有用户和图像。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">取消</v-btn>
          <v-btn color="error" @click="deleteOrganization" :loading="deleting">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 组织详情对话框 -->
    <v-dialog v-model="showDetailsDialog" max-width="600">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">组织详情</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <div class="d-flex justify-center">
              <v-avatar size="120">
                <v-img :src="getImageUrl(selectedOrg?.logo || '')" cover></v-img>
              </v-avatar>
            </div>
            <v-divider></v-divider>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-office-building</v-icon>
                <span class="text-subtitle-1">组织名称：</span>
                <span class="text-body-1 ml-2">{{ selectedOrg?.name }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-text</v-icon>
                <span class="text-subtitle-1">组织描述：</span>
                <span class="text-body-1 ml-2">{{ selectedOrg?.description }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-account-group</v-icon>
                <span class="text-subtitle-1">用户数量：</span>
                <v-chip
                  color="info"
                  size="small"
                  class="ml-2"
                >
                  {{ selectedOrg?.userCount }} 人
                </v-chip>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-image-multiple</v-icon>
                <span class="text-subtitle-1">图像数量：</span>
                <v-chip
                  color="success"
                  size="small"
                  class="ml-2"
                >
                  {{ selectedOrg?.fileCount }} 张
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showDetailsDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 筛选对话框 -->
    <v-dialog v-model="showFilterDialog" max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="text-h6 font-weight-bold">筛选条件</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-4">
            <v-text-field
              v-model="filters.name"
              label="组织名称"
              clearable
              hide-details
            ></v-text-field>
            
            <v-text-field
              v-model="filters.description"
              label="组织描述"
              clearable
              hide-details
            ></v-text-field>

            <div class="d-flex flex-column gap-2">
              <div class="text-subtitle-2">用户数量范围</div>
              <div class="d-flex align-center gap-2">
                <v-text-field
                  v-model="filters.userCountMin"
                  label="最小值"
                  type="number"
                  hide-details
                  density="compact"
                ></v-text-field>
                <span class="text-caption">至</span>
                <v-text-field
                  v-model="filters.userCountMax"
                  label="最大值"
                  type="number"
                  hide-details
                  density="compact"
                ></v-text-field>
              </div>
            </div>

            <div class="d-flex flex-column gap-2">
              <div class="text-subtitle-2">图像数量范围</div>
              <div class="d-flex align-center gap-2">
                <v-text-field
                  v-model="filters.fileCountMin"
                  label="最小值"
                  type="number"
                  hide-details
                  density="compact"
                ></v-text-field>
                <span class="text-caption">至</span>
                <v-text-field
                  v-model="filters.fileCountMax"
                  label="最大值"
                  type="number"
                  hide-details
                  density="compact"
                ></v-text-field>
              </div>
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
import { ref, onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { mockApi } from '@/mock/users-adm'

const snackbar = useSnackbarStore()

interface Organization {
  id: number
  name: string
  description: string
  logo: string
  userCount: number
  fileCount: number
}

interface OrganizationStats {
  totalOrgs: number
  totalUsers: number
  totalFiles: number
}

const headers = [
  { title: 'Logo', key: 'logo', align: 'center', sortable: false },
  { title: '组织名称', key: 'name', align: 'start' },
  { title: '组织描述', key: 'description', align: 'start' },
  { title: '用户数量', key: 'userCount', align: 'center' },
  { title: '图像数量', key: 'fileCount', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
] as const

// 统计信息
const stats = ref<OrganizationStats>({
  totalOrgs: 0,
  totalUsers: 0,
  totalFiles: 0
})

// 分页相关
const organizations = ref<Organization[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrgs = ref(0)
const totalPages = ref(1)

// 对话框相关
const showOrgDialog = ref(false)
const showDeleteDialog = ref(false)
const showDetailsDialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedOrg = ref<Organization | null>(null)
const logoFile = ref<File | null>(null)

// 编辑中的组织数据
const editingOrg = ref<Organization>({
  id: 0,
  name: '',
  description: '',
  logo: '',
  userCount: 0,
  fileCount: 0
})

// 筛选相关
const showFilterDialog = ref(false)
const filters = ref({
  name: '',
  description: '',
  userCountMin: '',
  userCountMax: '',
  fileCountMin: '',
  fileCountMax: ''
})

// 获取组织列表
const fetchOrganizations = async (page: number, pageSize: number) => {
  loading.value = true
  try {
    const response = await mockApi.getOrganizations()
    let orgs = response.data.organizations
    
    // 应用筛选条件
    if (filters.value.name) {
      orgs = orgs.filter(org => 
        org.name.toLowerCase().includes(filters.value.name.toLowerCase())
      )
    }
    
    if (filters.value.description) {
      orgs = orgs.filter(org => 
        org.description.toLowerCase().includes(filters.value.description.toLowerCase())
      )
    }
    
    if (filters.value.userCountMin) {
      orgs = orgs.filter(org => 
        org.userCount >= parseInt(filters.value.userCountMin)
      )
    }
    
    if (filters.value.userCountMax) {
      orgs = orgs.filter(org => 
        org.userCount <= parseInt(filters.value.userCountMax)
      )
    }
    
    if (filters.value.fileCountMin) {
      orgs = orgs.filter(org => 
        org.fileCount >= parseInt(filters.value.fileCountMin)
      )
    }
    
    if (filters.value.fileCountMax) {
      orgs = orgs.filter(org => 
        org.fileCount <= parseInt(filters.value.fileCountMax)
      )
    }
    
    // 模拟分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    organizations.value = orgs.slice(start, end)
    totalOrgs.value = orgs.length
    totalPages.value = Math.ceil(orgs.length / pageSize)
    
    // 更新统计信息
    stats.value = {
      totalOrgs: orgs.length,
      totalUsers: orgs.reduce((sum: number, org: Organization) => sum + org.userCount, 0),
      totalFiles: orgs.reduce((sum: number, org: Organization) => sum + org.fileCount, 0)
    }
  } catch (error) {
    console.error('获取组织列表失败:', error)
    snackbar.showMessage('获取组织列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchOrganizations(page, pageSize.value)
}

// 处理每页数量变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrganizations(1, size)
}

// 打开创建对话框
const openCreateDialog = () => {
  isEditing.value = false
  editingOrg.value = {
    id: 0,
    name: '',
    description: '',
    logo: '',
    userCount: 0,
    fileCount: 0
  }
  logoFile.value = null
  showOrgDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (org: Organization) => {
  isEditing.value = true
  editingOrg.value = { ...org }
  logoFile.value = null
  showOrgDialog.value = true
}

// 打开删除对话框
const openDeleteDialog = (org: Organization) => {
  selectedOrg.value = org
  showDeleteDialog.value = true
}

// 打开详情对话框
const openDetailsDialog = (org: Organization) => {
  selectedOrg.value = org
  showDetailsDialog.value = true
}

// 保存组织
const saveOrganization = async () => {
  if (!editingOrg.value.name || !editingOrg.value.description) {
    snackbar.showMessage('请填写完整信息', 'error')
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      // 编辑现有组织
      await mockApi.updateOrganization(editingOrg.value.id, editingOrg.value)
      snackbar.showMessage('组织更新成功', 'success')
    } else {
      // 创建新组织
      await mockApi.createOrganization(editingOrg.value)
      snackbar.showMessage('组织创建成功', 'success')
    }
    showOrgDialog.value = false
    fetchOrganizations(currentPage.value, pageSize.value)
  } catch (error) {
    console.error('保存组织失败:', error)
    snackbar.showMessage('保存组织失败', 'error')
  } finally {
    saving.value = false
  }
}

// 删除组织
const deleteOrganization = async () => {
  if (!selectedOrg.value) return

  deleting.value = true
  try {
    await mockApi.deleteOrganization(selectedOrg.value.id)
    snackbar.showMessage('组织删除成功', 'success')
    showDeleteDialog.value = false
    fetchOrganizations(currentPage.value, pageSize.value)
  } catch (error) {
    console.error('删除组织失败:', error)
    snackbar.showMessage('删除组织失败', 'error')
  } finally {
    deleting.value = false
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    name: '',
    description: '',
    userCountMin: '',
    userCountMax: '',
    fileCountMin: '',
    fileCountMax: ''
  }
  currentPage.value = 1
  pageSize.value = 10
  fetchOrganizations(1, 10)
  showFilterDialog.value = false
}

// 应用筛选条件
const applyFilters = () => {
  currentPage.value = 1
  pageSize.value = 10
  fetchOrganizations(1, 10)
  showFilterDialog.value = false
}

const getImageUrl = (url: string) => {
  return import.meta.env.VITE_API_URL + url
}

// 初始化
onMounted(() => {
  fetchOrganizations(currentPage.value, pageSize.value)
})
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

.user-count-chip,
.file-count-chip {
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
