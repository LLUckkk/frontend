<template>
    <v-container>
      <!-- 标题 -->
      <v-row class="mb-6">
        <v-col>
          <h1 class="text-h4 font-weight-bold">日志记录</h1>
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
          <v-btn 
            color="success" 
            class="text-none" 
            prepend-icon="mdi-download"
            @click="downloadLogs"
          >
            下载日志
          </v-btn>
        </v-col>
      </v-row>
  
      <v-card class="elevation-2">
        <v-data-table
          :headers="headers"
          :items="logs"
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
  
          <template v-slot:item.actionType="{ item }">
            <v-chip
              :color="getActionTypeColor(item.actionType)"
              size="small"
              class="action-chip"
            >
              {{ item.actionType }}
            </v-chip>
          </template>
  
          <template v-slot:item.actionTime="{ item }">
            {{ formatTime(item.actionTime) }}
          </template>
  
          <template v-slot:item.actions="{ item }">
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
  
      <!-- 删除确认对话框 -->
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card class="elevation-4">
          <v-card-title class="text-h6 font-weight-bold">确认删除</v-card-title>
          <v-card-text>
            确定要删除这条日志记录吗？此操作不可撤销。
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="showDeleteDialog = false">取消</v-btn>
            <v-btn color="error" @click="deleteLog">删除</v-btn>
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
                v-model="filters.actionType"
                :items="actionTypeOptions"
                label="操作类型"
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

      <!-- 下载日志对话框 -->
      <v-dialog v-model="showDownloadDialog" max-width="500">
        <v-card class="elevation-4">
          <v-card-title class="text-h6 font-weight-bold">下载日志</v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-4">
              <v-select
                v-model="downloadFilters.role"
                :items="roleOptions"
                label="角色"
                clearable
                hide-details
              ></v-select>
              
              <v-select
                v-model="downloadFilters.actionType"
                :items="actionTypeOptions"
                label="操作类型"
                clearable
                hide-details
              ></v-select>
              
              <v-select
                v-model="downloadFilters.timeRange"
                :items="timeRangeOptions"
                label="快速选择时间范围"
                clearable
                hide-details
                @update:model-value="handleDownloadTimeRangeChange"
              ></v-select>

              <div class="d-flex align-center gap-4">
                <v-text-field
                  v-model="downloadFilters.startDate"
                  label="开始时间"
                  type="datetime-local"
                  hide-details
                  density="compact"
                  :error-messages="downloadTimeError"
                  @update:model-value="handleDownloadCustomTimeChange"
                ></v-text-field>
                <v-text-field
                  v-model="downloadFilters.endDate"
                  label="结束时间"
                  type="datetime-local"
                  hide-details
                  density="compact"
                  :error-messages="downloadTimeError"
                  @update:model-value="handleDownloadCustomTimeChange"
                ></v-text-field>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="showDownloadDialog = false">取消</v-btn>
            <v-btn color="success" @click="handleDownload">下载</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  
  interface Log {
    id: number
    avatar: string
    username: string
    role: string
    actionType: string
    actionTime: number
    targetId: number
  }
  
  const headers = [
    { title: '头像', key: 'avatar', align: 'center', sortable: false },
    { title: '用户名', key: 'username', align: 'start' },
    { title: '角色', key: 'role', align: 'center' },
    { title: '操作类型', key: 'actionType', align: 'center' },
    { title: '操作时间', key: 'actionTime', align: 'center' },
    { title: '操作对象ID', key: 'targetId', align: 'center' },
    { title: '操作', key: 'actions', align: 'center', sortable: false },
  ] as const
  
  const logs = ref<Log[]>([
    {
      id: 1,
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      username: 'JCLR 2021',
      role: '出版社',
      actionType: '上传',
      actionTime: Date.now(),
      targetId: 1001
    },
    {
      id: 2,
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      username: '审稿人A',
      role: '审稿人',
      actionType: '提交审核',
      actionTime: Date.now() - 24 * 60 * 60 * 1000,
      targetId: 1002
    },
    {
      id: 3,
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      username: '出版社B',
      role: '出版社',
      actionType: '检测',
      actionTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
      targetId: 1003
    },
    {
      id: 4,
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      username: '审稿人B',
      role: '审稿人',
      actionType: '提交审核',
      actionTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
      targetId: 1004
    },
    {
      id: 5,
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      username: '出版社C',
      role: '出版社',
      actionType: '发布审核',
      actionTime: Date.now() - 4 * 24 * 60 * 60 * 1000,
      targetId: 1005
    }
  ])
  
  // 删除对话框相关
  const showDeleteDialog = ref(false)
  const selectedLog = ref<Log | null>(null)
  
  // 搜索相关
  const searchQuery = ref('')
  
  const handleSearch = () => {
    if (!searchQuery.value) {
      logs.value = [...originalLogs.value]
      return
    }
    
    const query = searchQuery.value.toLowerCase()
    logs.value = originalLogs.value.filter(log => 
      log.username.toLowerCase().includes(query)
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
  
  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case '上传':
        return 'info'
      case '检测':
        return 'warning'
      case '发布审核':
        return 'success'
      case '提交审核':
        return 'primary'
      default:
        return 'grey'
    }
  }
  
  const openDeleteDialog = (log: Log) => {
    selectedLog.value = log
    showDeleteDialog.value = true
  }
  
  const deleteLog = () => {
    if (selectedLog.value) {
      logs.value = logs.value.filter(l => l.id !== selectedLog.value!.id)
    }
    showDeleteDialog.value = false
  }
  
  // 筛选相关
  const showFilterDialog = ref(false)
  const filters = ref<{
    role: string | null
    actionType: string | null
    timeRange: string | null
    startDate: string | null
    endDate: string | null
  }>({
    role: null,
    actionType: null,
    timeRange: null,
    startDate: null,
    endDate: null
  })
  
  const roleOptions = [
    { title: '出版社', value: '出版社' },
    { title: '审稿人', value: '审稿人' }
  ]
  
  const actionTypeOptions = [
    { title: '上传', value: '上传' },
    { title: '检测', value: '检测' },
    { title: '发布审核', value: '发布审核' },
    { title: '提交审核', value: '提交审核' }
  ]
  
  const timeRangeOptions = [
    { title: '最近一天', value: '1d' },
    { title: '最近一周', value: '7d' },
    { title: '最近一月', value: '30d' },
    { title: '最近三月', value: '90d' },
    { title: '最近一年', value: '365d' }
  ]
  
  // 保存原始数据用于重置
  const originalLogs = ref<Log[]>([])
  
  // 初始化时保存原始数据
  const initOriginalLogs = () => {
    originalLogs.value = [...logs.value]
  }
  
  // 重置筛选条件
  const resetFilters = () => {
    filters.value = {
      role: null,
      actionType: null,
      timeRange: null,
      startDate: null,
      endDate: null
    }
    logs.value = [...originalLogs.value]
    showFilterDialog.value = false
  }
  
  // 在 script 部分添加时间验证相关的代码
  const timeError = ref('')
  const downloadTimeError = ref('')
  
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
  
  // 更新 applyFilters 函数
  const applyFilters = () => {
    // 如果有时间错误，不执行筛选
    if (timeError.value) {
      return
    }
    
    let filteredLogs = [...originalLogs.value]
    
    // 角色筛选
    if (filters.value.role) {
      filteredLogs = filteredLogs.filter(log => log.role === filters.value.role)
    }
    
    // 操作类型筛选
    if (filters.value.actionType) {
      filteredLogs = filteredLogs.filter(log => log.actionType === filters.value.actionType)
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
      filteredLogs = filteredLogs.filter(log => (now - log.actionTime) <= range)
    } else if (filters.value.startDate && filters.value.endDate) {
      const startTime = new Date(filters.value.startDate).getTime()
      const endTime = new Date(filters.value.endDate).getTime()
      filteredLogs = filteredLogs.filter(log => 
        log.actionTime >= startTime && log.actionTime <= endTime
      )
    }
    
    logs.value = filteredLogs
    showFilterDialog.value = false
  }
  
  // 下载对话框相关
  const showDownloadDialog = ref(false)
  const downloadFilters = ref<{
    role: string | null
    actionType: string | null
    timeRange: string | null
    startDate: string | null
    endDate: string | null
  }>({
    role: null,
    actionType: null,
    timeRange: null,
    startDate: null,
    endDate: null
  })
  
  // 修改下载按钮点击事件
  const downloadLogs = () => {
    showDownloadDialog.value = true
  }
  
  // 处理下载对话框的快速选择时间范围变化
  const handleDownloadTimeRangeChange = (value: string | null) => {
    if (value) {
      // 如果选择了快速时间范围，清空自定义时间
      downloadFilters.value.startDate = null
      downloadFilters.value.endDate = null
      downloadTimeError.value = ''
    }
  }
  
  // 处理下载对话框的自定义时间变化
  const handleDownloadCustomTimeChange = () => {
    // 如果输入了自定义时间，清空快速选择
    downloadFilters.value.timeRange = null
    
    // 验证时间
    if (!downloadFilters.value.startDate || !downloadFilters.value.endDate) {
      downloadTimeError.value = '开始时间和结束时间不能为空'
      return
    }

    const startTime = new Date(downloadFilters.value.startDate).getTime()
    const endTime = new Date(downloadFilters.value.endDate).getTime()
    
    if (startTime >= endTime) {
      downloadTimeError.value = '开始时间必须早于结束时间'
    } else {
      downloadTimeError.value = ''
    }
  }
  
  // 更新 handleDownload 函数
  const handleDownload = () => {
    // 如果有时间错误，不执行下载
    if (downloadTimeError.value) {
      return
    }
    
    // 获取筛选后的日志
    let logsToDownload = [...originalLogs.value]
    
    // 应用筛选条件
    if (downloadFilters.value.role) {
      logsToDownload = logsToDownload.filter(log => log.role === downloadFilters.value.role)
    }
    
    if (downloadFilters.value.actionType) {
      logsToDownload = logsToDownload.filter(log => log.actionType === downloadFilters.value.actionType)
    }
    
    // 时间范围筛选
    if (downloadFilters.value.timeRange) {
      const now = Date.now()
      const ranges = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '365d': 365 * 24 * 60 * 60 * 1000
      }
      const range = ranges[downloadFilters.value.timeRange as keyof typeof ranges]
      logsToDownload = logsToDownload.filter(log => (now - log.actionTime) <= range)
    } else if (downloadFilters.value.startDate && downloadFilters.value.endDate) {
      const startTime = new Date(downloadFilters.value.startDate).getTime()
      const endTime = new Date(downloadFilters.value.endDate).getTime()
      logsToDownload = logsToDownload.filter(log => 
        log.actionTime >= startTime && log.actionTime <= endTime
      )
    }
    
    // 构建日志内容
    let content = '日志记录\n'
    content += '导出时间：' + formatTime(Date.now()) + '\n'
    content += '筛选条件：\n'
    if (downloadFilters.value.role) content += `角色: ${downloadFilters.value.role}\n`
    if (downloadFilters.value.actionType) content += `操作类型: ${downloadFilters.value.actionType}\n`
    if (downloadFilters.value.timeRange) content += `快速选择时间范围: ${timeRangeOptions.find(opt => opt.value === downloadFilters.value.timeRange)?.title}\n`
    if (downloadFilters.value.startDate) content += `开始时间: ${downloadFilters.value.startDate}\n`
    if (downloadFilters.value.endDate) content += `结束时间: ${downloadFilters.value.endDate}\n`
    content += '\n'
    
    logsToDownload.forEach(log => {
      content += `ID: ${log.id}\n`
      content += `用户名: ${log.username}\n`
      content += `角色: ${log.role}\n`
      content += `操作类型: ${log.actionType}\n`
      content += `操作时间: ${formatTime(log.actionTime)}\n`
      content += `操作对象ID: ${log.targetId}\n`
      content += '----------------------------------------\n'
    })
    
    // 创建Blob对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    
    // 设置文件名（包含时间戳和筛选条件）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    let fileName = `logs_${timestamp}`
    if (downloadFilters.value.role) fileName += `_${downloadFilters.value.role}`
    if (downloadFilters.value.actionType) fileName += `_${downloadFilters.value.actionType}`
    if (downloadFilters.value.timeRange) fileName += `_${downloadFilters.value.timeRange}`
    fileName += '.txt'
    link.download = fileName
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 释放URL对象
    URL.revokeObjectURL(link.href)
    
    // 关闭对话框
    showDownloadDialog.value = false
  }
  
  // 初始化
  initOriginalLogs()
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
  
  .action-chip {
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
  