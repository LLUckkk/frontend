<template>
  <v-container fluid class="organizations-page">
    <!-- 标题和操作按钮 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">组织管理</h1>
      </v-col>
      <v-col cols="auto" class="d-flex align-center">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          elevation="2"
          @click="openCreateDialog"
        >
          新建组织
        </v-btn>
      </v-col>
    </v-row>

    <!-- 组织列表 -->
    <v-row>
      <v-col cols="12">
        <v-card class="list-card" elevation="2">
          <v-tabs
            v-model="activeTab"
            color="primary"
            class="tabs-header"
            height="60"
          >
            <v-tab value="existing" class="text-h6">
              现有组织
            </v-tab>
            <v-tab value="pending" class="text-h6">
              待审核组织
            </v-tab>
          </v-tabs>

          <v-card-text class="pa-6">
            <v-window v-model="activeTab">
              <!-- 现有组织列表 -->
              <v-window-item value="existing">
                <v-data-table
                  :headers="headers"
                  :items="existingOrganizations"
                  :loading="loading"
                  class="elevation-1 rounded-lg"
                  hover
                >
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      color="primary"
                      class="me-2 action-btn"
                      variant="tonal"
                      @click="editOrganization(item)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      class="action-btn"
                      variant="tonal"
                      @click="deleteOrganization(item)"
                    ></v-btn>
                  </template>
                </v-data-table>
              </v-window-item>

              <!-- 待审核组织列表 -->
              <v-window-item value="pending">
                <v-data-table
                  :headers="pendingHeaders"
                  :items="pendingOrganizations"
                  :loading="loading"
                  class="elevation-1 rounded-lg"
                  hover
                >
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon="mdi-eye"
                      size="small"
                      color="info"
                      class="me-2 action-btn"
                      variant="tonal"
                      @click="showDetails(item)"
                    ></v-btn>
                    <v-btn
                      color="success"
                      size="small"
                      class="me-2 action-btn"
                      variant="tonal"
                      @click="approveOrganization(item)"
                    >
                      通过
                    </v-btn>
                    <v-btn
                      color="error"
                      size="small"
                      class="action-btn"
                      variant="tonal"
                      @click="rejectOrganization(item)"
                    >
                      拒绝
                    </v-btn>
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 创建/编辑组织对话框 -->
    <v-dialog v-model="dialog" max-width="800px" transition="dialog-bottom-transition">
      <v-card class="dialog-card">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon size="24" color="primary" class="me-2">{{ formTitle === '新建组织' ? 'mdi-plus' : 'mdi-pencil' }}</v-icon>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-container>
            <v-row>
              <v-col cols="12" class="d-flex justify-center">
                <v-avatar size="200" class="mb-4 organization-logo">
                  <v-img :src="editedItem.logoPreview || '/default-organization.png'" alt="组织Logo"></v-img>
                </v-avatar>
              </v-col>
              <v-col cols="12" class="d-flex justify-center">
                <v-file-input
                  v-model="editedItem.logo"
                  accept="image/*"
                  label="上传Logo"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                  :rules="orgRules.logo"
                  @change="handleLogoChange"
                  class="mb-4"
                ></v-file-input>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="组织名称"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  :rules="orgRules.name"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="组织描述"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  rows="3"
                  :rules="orgRules.description"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.email"
                  label="组织邮箱"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  type="email"
                  :rules="orgRules.email"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <div class="text-h6 mb-4">管理员账号信息</div>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.adminUsername"
                  label="管理员用户名"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  :rules="orgRules.adminUsername"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.adminEmail"
                  label="管理员邮箱"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  type="email"
                  :rules="orgRules.adminEmail"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.adminPassword"
                  label="管理员密码"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  type="password"
                  :rules="orgRules.adminPassword"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.adminPasswordConfirm"
                  label="确认密码"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                  type="password"
                  :rules="orgRules.adminPasswordConfirm"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="error" variant="tonal" @click="closeDialog" class="me-2">
            取消
          </v-btn>
          <v-btn color="primary" @click="saveOrganization" :disabled="!isFormValid" :loading="creatingOrg">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 申请详情对话框 -->
    <v-dialog v-model="detailsDialog" max-width="800px" transition="dialog-bottom-transition">
      <v-card class="dialog-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center">
            <v-icon size="24" color="primary" class="me-2">mdi-eye</v-icon>
            <span class="text-h5">申请详情</span>
          </div>
          <v-btn icon @click="detailsDialog = false" variant="tonal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-container>
            <v-row>
              <v-col cols="12" class="d-flex justify-center">
                <v-avatar size="200" class="mb-6 organization-logo">
                  <v-img :src="selectedItem.logo || '/default-organization.png'" alt="组织Logo"></v-img>
                </v-avatar>
              </v-col>
              <v-col cols="12">
                <v-list class="rounded-lg pa-4 bg-grey-lighten-4">
                  <v-list-item class="mb-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="24">mdi-office-building</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">组织名称</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.name }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item class="mb-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="24">mdi-account</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">申请人</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.applicant }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item class="mb-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="24">mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">申请时间</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.appliedAt }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" size="24">mdi-text-box</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">组织描述</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.description }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12">
                <v-card class="mt-6 documents-card" elevation="2">
                  <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="primary" size="24" class="me-2">mdi-file-document</v-icon>
                    <span class="text-h6">相关证明材料</span>
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-list class="rounded-lg">
                      <v-list-item v-for="(doc, index) in selectedItem.documents" :key="index" class="mb-2">
                        <template v-slot:prepend>
                          <v-icon color="primary" size="24">mdi-file-pdf-box</v-icon>
                        </template>
                        <v-list-item-title class="text-subtitle-1">{{ doc.name }}</v-list-item-title>
                        <template v-slot:append>
                          <v-btn
                            color="primary"
                            variant="tonal"
                            prepend-icon="mdi-download"
                            @click="downloadDocument(doc)"
                          >
                            下载
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import organization from '@/api/organization'

const snackbar = useSnackbarStore()

// 类型定义
interface Organization {
  id: number
  name: string
  description: string
  email: string
  logo?: string
  createdAt: string
}

interface PendingOrganization extends Organization {
  applicant: string
  appliedAt: string
  documents: Array<{
    name: string
    url: string
  }>
}

interface EditedItem {
  name: string
  description: string
  logo: File | null
  logoPreview: string
  email: string
  adminUsername: string
  adminEmail: string
  adminPassword: string
  adminPasswordConfirm: string
}

// 状态变量
const activeTab = ref('existing')
const loading = ref(false)
const dialog = ref(false)
const editedIndex = ref(-1)
const creatingOrg = ref(false)
const editedItem = ref<EditedItem>({
  name: '',
  description: '',
  logo: null,
  logoPreview: '',
  email: '',
  adminUsername: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: ''
})

// 表格头部配置
const headers = [
  { title: '组织名称', key: 'name' },
  { title: '描述', key: 'description' },
  { title: '邮箱', key: 'email' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false }
]

const pendingHeaders = [
  { title: '组织名称', key: 'name' },
  { title: '申请人', key: 'applicant' },
  { title: '申请时间', key: 'appliedAt' },
  { title: '描述', key: 'description' },
  { title: '操作', key: 'actions', sortable: false }
]

// 表单验证规则
const orgRules = {
  name: [
    (v: string) => !!v || '组织名称不能为空',
    (v: string) => v.length >= 2 || '组织名称至少2个字符'
  ],
  description: [
    (v: string) => !!v || '组织描述不能为空',
    (v: string) => v.length >= 10 || '组织描述至少10个字符'
  ],
  logo: [
    (v: File | null) => !!v || '请上传组织Logo',
    (v: File | null) => !v || v.size <= 5 * 1024 * 1024 || 'Logo大小不能超过5MB'
  ],
  email: [
    (v: string) => !!v || '组织邮箱不能为空',
    (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
  ],
  adminUsername: [
    (v: string) => !!v || '管理员用户名不能为空',
    (v: string) => v.length >= 2 || '用户名至少2个字符'
  ],
  adminEmail: [
    (v: string) => !!v || '管理员邮箱不能为空',
    (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
  ],
  adminPassword: [
    (v: string) => !!v || '管理员密码不能为空',
    (v: string) => v.length >= 6 || '密码至少6位'
  ],
  adminPasswordConfirm: [
    (v: string) => !!v || '请确认密码',
    (v: string) => v === editedItem.value.adminPassword || '两次输入的密码不一致'
  ]
}

// 模拟数据
const existingOrganizations = ref<Organization[]>([])
const pendingOrganizations = ref<PendingOrganization[]>([])

// 计算属性
const formTitle = computed(() => {
  return editedIndex.value === -1 ? '新建组织' : '编辑组织'
})

const isFormValid = computed(() => {
  const hasName = editedItem.value.name && editedItem.value.name.length >= 2
  const hasDescription = editedItem.value.description && editedItem.value.description.length >= 10
  const hasLogo = editedItem.value.logo !== null
  const hasEmail = editedItem.value.email && /.+@.+\..+/.test(editedItem.value.email)
  const hasAdminUsername = editedItem.value.adminUsername && editedItem.value.adminUsername.length >= 2
  const hasAdminEmail = editedItem.value.adminEmail && /.+@.+\..+/.test(editedItem.value.adminEmail)
  const hasAdminPassword = editedItem.value.adminPassword && editedItem.value.adminPassword.length >= 6
  const hasAdminPasswordConfirm = editedItem.value.adminPasswordConfirm === editedItem.value.adminPassword
  return hasName && hasDescription && hasLogo && hasEmail && hasAdminUsername && hasAdminEmail && hasAdminPassword && hasAdminPasswordConfirm
})

// 方法
const openCreateDialog = () => {
  editedIndex.value = -1
  editedItem.value = {
    name: '',
    description: '',
    logo: null,
    logoPreview: '',
    email: '',
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: ''
  }
  dialog.value = true
}

const editOrganization = (item: Organization) => {
  editedIndex.value = existingOrganizations.value.indexOf(item)
  editedItem.value = {
    name: item.name,
    description: item.description,
    logo: null,
    logoPreview: item.logo || '',
    email: item.email,
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: ''
  }
  dialog.value = true
}

const deleteOrganization = async (item: Organization) => {
  try {
    // TODO: 实现删除组织的API调用
    snackbar.showMessage('删除成功', 'success')
  } catch (error) {
    snackbar.showMessage('删除失败', 'error')
  }
}

const approveOrganization = async (item: PendingOrganization) => {
  try {
    // TODO: 实现审核通过的API调用
    snackbar.showMessage('审核通过', 'success')
  } catch (error) {
    snackbar.showMessage('操作失败', 'error')
  }
}

const rejectOrganization = async (item: PendingOrganization) => {
  try {
    // TODO: 实现审核拒绝的API调用
    snackbar.showMessage('已拒绝', 'success')
  } catch (error) {
    snackbar.showMessage('操作失败', 'error')
  }
}

const closeDialog = () => {
  dialog.value = false
  editedIndex.value = -1
}

const handleLogoChange = (file: File | null) => {
  if (file && file instanceof File) {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          editedItem.value.logoPreview = e.target.result as string
        }
      }
      reader.onerror = () => {
        console.error('读取文件失败')
        editedItem.value.logoPreview = ''
        snackbar.showMessage('读取文件失败，请重试', 'error')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('处理文件时出错:', error)
      editedItem.value.logoPreview = ''
      snackbar.showMessage('处理文件时出错，请重试', 'error')
    }
  } else {
    editedItem.value.logoPreview = ''
  }
}

const saveOrganization = async () => {
  if (!isFormValid.value) {
    snackbar.showMessage('请填写所有必填字段', 'error')
    return
  }
  try {
    creatingOrg.value = true
    const formData = new FormData()
    formData.append('name', editedItem.value.name)
    formData.append('description', editedItem.value.description)
    if (editedItem.value.logo) {
      formData.append('logo', editedItem.value.logo)
    }
    formData.append('email', editedItem.value.email)
    formData.append('admin_username', editedItem.value.adminUsername)
    formData.append('admin_email', editedItem.value.adminEmail)
    formData.append('admin_password', editedItem.value.adminPassword)
    formData.append('admin_password_confirm', editedItem.value.adminPasswordConfirm)
    await organization.createOrganization(formData)
    snackbar.showMessage('组织创建成功', 'success')
    closeDialog()
  } catch (error: any) {
    console.error('创建组织失败:', error)
    const errorMsg = error.response?.data?.message || '创建组织失败'
    snackbar.showMessage(errorMsg, 'error')
  } finally {
    creatingOrg.value = false
  }
}

// 详情对话框相关
const detailsDialog = ref(false)
const selectedItem = ref<PendingOrganization>({
  id: 0,
  name: '',
  applicant: '',
  appliedAt: '',
  description: '',
  email: '',
  createdAt: '',
  documents: []
})

const showDetails = (item: PendingOrganization) => {
  selectedItem.value = { ...item }
  detailsDialog.value = true
}

const downloadDocument = (doc: { name: string; url: string }) => {
  window.open(doc.url, '_blank')
}
</script>

<style scoped>
.organizations-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.page-header {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.create-btn {
  transition: all 0.2s;
  border: 1px solid rgb(var(--v-theme-primary));
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.2);
}

.list-card {
  border-radius: 12px;
  overflow: hidden;
}

.tabs-header {
  background-color: rgb(var(--v-theme-surface));
}

.action-btn {
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.dialog-card {
  border-radius: 12px;
}

.organization-logo {
  border: 4px solid rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.documents-card {
  border-radius: 12px;
}

:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-row) {
  transition: background-color 0.2s;
}

:deep(.v-data-table-row:hover) {
  background-color: rgb(var(--v-theme-surface-variant));
}

:deep(.v-tab) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}
</style>