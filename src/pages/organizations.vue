<template>
  <v-container fluid class="organizations-page">
    <!-- 标题和操作按钮 -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">组织管理</h1>
      </v-col>
    </v-row>

    <!-- 搜索和筛选区域 -->
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="8" md="6">
        <v-text-field
          v-model="searchQuery"
          label="搜索组织名称"
          append-inner-icon="mdi-magnify"
          clearable
          density="compact"
          hide-details
          class="search-input"
          @keyup.enter="handleSearch"
          @click:append-inner="handleSearch"
          @click:clear="handleSearch"
          placeholder="请输入组织名称"
        ></v-text-field>
      </v-col>
      <v-spacer></v-spacer>
      <!--need zhw here-->
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
                  :items="organizations"
                  :loading="loading"
                  class="elevation-1 rounded-lg"
                  hover
                  :items-per-page="pageSize"
                  hide-default-footer
                >
                  <template v-slot:top>
                    <div class="d-flex align-center pa-4">
                      <div class="text-caption text-medium-emphasis">
                        共 {{ totalOrganizations }} 条记录
                      </div>
                    </div>
                  </template>

                  <template v-slot:item.logo="{ item }">
                    <v-avatar size="40">
                      <v-img :src="getImgUrl(item.logo)" :alt="item.name"></v-img>
                    </v-avatar>
                  </template>

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
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      class="action-btn"
                      variant="tonal"
                      @click="showDeleteConfirm(item)"
                    ></v-btn>
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
                      @update:model-value="handleItemsPerPageChange"
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
              </v-window-item>

              <!-- 待审核组织列表 -->
              <v-window-item value="pending">
                <v-data-table
                  :headers="pendingHeaders"
                  :items="pendingOrganizations"
                  :loading="loading"
                  class="elevation-1 rounded-lg"
                  hover
                  :items-per-page="pageSize"
                  hide-default-footer
                >
                  <template v-slot:top>
                    <div class="d-flex align-center pa-4">
                      <div class="text-caption text-medium-emphasis">
                        共 {{ totalPendingOrganizations }} 条记录
                      </div>
                    </div>
                  </template>

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
                      @click="approveOrganization(item.id)"
                    >
                      通过
                    </v-btn>
                    <v-btn
                      color="error"
                      size="small"
                      class="action-btn"
                      variant="tonal"
                      @click="rejectOrganization(item.id)"
                    >
                      拒绝
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
                      @update:model-value="handleItemsPerPageChange"
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
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 组织详情对话框 -->
    <v-dialog v-model="detailsDialog" max-width="800px" transition="dialog-bottom-transition">
      <v-card class="dialog-card" v-if="selectedItem">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center">
            <v-icon size="24" color="primary" class="me-2">mdi-eye</v-icon>
            <span class="text-h5">组织详情</span>
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
                  <v-img :src="getImgUrl(selectedItem.logo)" alt="组织Logo"></v-img>
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
                      <v-icon color="primary" size="24">mdi-text-box</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">组织描述</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.description || '暂无描述' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item class="mb-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="24">mdi-account-group</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">用户数量</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.user_count }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item class="mb-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="24">mdi-image-multiple</v-icon>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-bold">图像数量</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 mt-1">{{ selectedItem.image_count }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" v-if="selectedItem.proof_materials">
                <v-card class="mt-6 documents-card" elevation="2">
                  <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="primary" size="24" class="me-2">mdi-file-document</v-icon>
                    <span class="text-h6">证明材料</span>
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-download"
                      @click="downloadProofMaterials(selectedItem.proof_materials)"
                    >
                      下载证明材料
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400px" transition="dialog-bottom-transition">
      <v-card class="dialog-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center">
            <v-icon size="24" color="error" class="me-2">mdi-alert</v-icon>
            <span class="text-h5">确认删除</span>
          </div>
          <v-btn icon @click="showDeleteDialog = false" variant="tonal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1">
            确定要删除组织 "{{ selectedItem?.name }}" 吗？此操作不可撤销。
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            @click="showDeleteDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            @click="confirmDelete"
            :loading="loading"
          >
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import organization from '@/api/organization'
import type { DataTableHeader } from 'vuetify'

const snackbar = useSnackbarStore()

// 表格头部配置
const headers = computed<DataTableHeader[]>(() => [
  { title: 'Logo', key: 'logo', align: 'center', sortable: false, width: '80px' },
  { title: '组织名称', key: 'name', align: 'start', width: '120px' },
  { title: '用户数量', key: 'user_count', align: 'center', width: '100px' },
  { title: '图像数量', key: 'image_count', align: 'center', width: '100px' },
  { title: '操作', key: 'actions', align: 'center', sortable: false, width: '120px' }
] as const)

const pendingHeaders = computed<DataTableHeader[]>(() => [
  { title: '组织名称', key: 'name', align: 'start', width: '120px' },
  { title: '管理员名', key: 'admin_username', align: 'start', width: '120px' },
  { title: '管理员邮箱', key: 'admin_email', align: 'start', width: '180px' },
  { title: '提交时间', key: 'submitted_at', align: 'center', width: '160px' },
  { title: '操作', key: 'actions', align: 'center', sortable: false, width: '180px' }
] as const)

// 类型定义
interface Organization {
  id: number
  name: string
  description: string
  logo?: string
  proof_materials?: string
  user_count: number
  image_count: number
}

interface PendingOrganization {
  id: number
  name: string
  email: string
  admin_username: string
  admin_email: string
  submitted_at: string
}

// 状态变量
const activeTab = ref('existing')
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrganizations = ref(0)
const totalPendingOrganizations = ref(0)
const totalPages = ref(1)
const showDeleteDialog = ref(false)
const detailsDialog = ref(false)
const selectedItem = ref<Organization | null>(null)
const organizations = ref<Organization[]>([])
const pendingOrganizations = ref<PendingOrganization[]>([])


const getImgUrl=(logo:any)=>{
  return import.meta.env.VITE_API_URL+logo
}

// 获取组织列表
const fetchOrganizations = async () => {
  try {
    loading.value = true
    const response = await organization.getOrgList({
      page: currentPage.value,
      page_size: pageSize.value,
      query: searchQuery.value
    })
    organizations.value = response.data.organizations
    totalOrganizations.value = response.data.total_organizations
    totalPages.value = response.data.total_pages
    currentPage.value = response.data.current_page
  } catch (error) {
    snackbar.showMessage('获取组织列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 获取待审核组织列表
const fetchPendingOrganizations = async () => {
  try {
    loading.value = true
    const response = await organization.getPendingOrgList({
      page: currentPage.value,
      page_size: pageSize.value,
      query: searchQuery.value
    })
    pendingOrganizations.value = response.data.applications
    totalPendingOrganizations.value = response.data.total_organizations
    totalPages.value = response.data.total_pages
    currentPage.value = response.data.current_page
  } catch (error) {
    snackbar.showMessage('获取待审核组织列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 显示组织详情
const showDetails = async (item: Organization | PendingOrganization) => {
  try {
    if ('user_count' in item) {
      // 现有组织
      const response = await organization.getOrgDetail({ organization_id: item.id })
      selectedItem.value = response.data
    } else {
      // 待审核组织
      selectedItem.value = {
        id: item.id,
        name: item.name,
        description: '',
        logo: undefined,
        proof_materials: undefined,
        user_count: 0,
        image_count: 0
      }
    }
  detailsDialog.value = true
  } catch (error) {
    snackbar.showMessage('获取组织详情失败', 'error')
  }
}

// 删除组织
const deleteOrganization = async (id: number) => {
  try {
    await organization.deleteOrg({ organization_id: id })
    snackbar.showMessage('删除成功', 'success')
    await fetchOrganizations()
  } catch (error) {
    snackbar.showMessage('删除失败', 'error')
  }
}

// 审核通过组织
const approveOrganization = async (id: number) => {
  try {
    await organization.approveOrg({ organization_id: id })
    snackbar.showMessage('审核通过成功', 'success')
    await fetchPendingOrganizations()
  } catch (error) {
    snackbar.showMessage('审核通过失败', 'error')
  }
}

// 拒绝组织申请
const rejectOrganization = async (id: number) => {
  try {
    await organization.rejectOrg({ organization_id: id })
    snackbar.showMessage('已拒绝申请', 'success')
    await fetchPendingOrganizations()
  } catch (error) {
    snackbar.showMessage('操作失败', 'error')
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  if (activeTab.value === 'existing') {
    fetchOrganizations()
  } else {
    fetchPendingOrganizations()
  }
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  if (activeTab.value === 'existing') {
    fetchOrganizations()
  } else {
    fetchPendingOrganizations()
  }
}

const handleItemsPerPageChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  if (activeTab.value === 'existing') {
    fetchOrganizations()
  } else {
    fetchPendingOrganizations()
  }
}

// 监听标签页切换
watch(activeTab, (newValue) => {
  currentPage.value = 1
  if (newValue === 'existing') {
    fetchOrganizations()
  } else {
    fetchPendingOrganizations()
  }
})

// 确认删除
const confirmDelete = async () => {
  if (selectedItem.value) {
    try {
      await deleteOrganization(selectedItem.value.id)
      showDeleteDialog.value = false
    } catch (error) {
      snackbar.showMessage('删除失败', 'error')
    }
  }
}

// 显示删除确认对话框
const showDeleteConfirm = (item: Organization) => {
  selectedItem.value = item
  showDeleteDialog.value = true
}

// 监听搜索查询变化
watch(searchQuery, () => {
  currentPage.value = 1
  if (activeTab.value === 'existing') {
    fetchOrganizations()
  } else {
    fetchPendingOrganizations()
  }
})

// 下载证明材料
const downloadProofMaterials = (url: string) => {
  if (!url) return
  const link = document.createElement('a')
  link.href = getImgUrl(url)
  link.download = '证明材料'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 初始化
onMounted(() => {
  fetchOrganizations()
})
</script>

<style scoped>
.organizations-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
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

.search-input {
  width: 100%;
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