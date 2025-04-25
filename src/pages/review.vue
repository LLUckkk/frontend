<template>
  <div class="review-page">
    <v-container>
      <!-- 标题 -->
      <v-row class="mb-6">
        <v-col>
          <h1 class="text-h4 font-weight-bold">我的任务</h1>
        </v-col>
      </v-row>

      <!-- 搜索栏和筛选按钮 -->
      <v-row class="mb-4">
        <v-col cols="12" sm="8" md="6">
          <v-text-field
            v-model="searchQuery"
            :label="selectedHeader ? selectedHeader.title : '请选择检索项'"
            append-inner-icon="mdi-magnify"
            density="compact"
            hide-details
            class="search-input"
            @keyup.enter="handleSearch"
            @click:append-inner="handleSearch"
            :readonly="!selectedHeader"
            :placeholder="selectedHeader ? '请输入检索内容' : ''"
          >
            <template v-slot:append>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn 
                    variant="outlined"
                    color="default" 
                    v-bind="props"
                    :append-icon="'mdi-chevron-down'"
                  >
                    检索方式
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="header in headers"
                    :key="header.key"
                    :value="header.key"
                    @click="selectHeader(header)"
                  >
                    <v-list-item-title>{{ header.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="6" class="d-flex justify-end">
          <v-btn
            color="primary"
            prepend-icon="mdi-filter"
            @click="showFilterDialog = true"
          >
            筛选
          </v-btn>
        </v-col>
      </v-row>

      <!-- 数据表格 -->
      <v-data-table
        :headers="fullHeaders"
        :items="filteredBookData"
        class="elevation-1"
        no-data-text="未检索到相关内容"
      >
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.operation="{ item }">
          <v-btn
            size="small"
            :color="item.status === '未完成' ? 'primary' : 'info'"
            variant="text"
            @click="goToTaskDetail(item)"
          >
            {{ item.operation }}
          </v-btn>
        </template>
      </v-data-table>
    </v-container>

    <!-- 筛选对话框 -->
    <v-dialog v-model="showFilterDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          筛选条件
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            size="small"
            class="ml-2"
            @click="showFilterDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="filters.status"
                  :items="['全部', '未完成', '已完成']"
                  label="状态"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="filters.publisher"
                  :items="[...new Set(bookData.map(item => item.publisher))]"
                  label="出版社"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="filters.dateRange.start"
                      label="开始日期"
                      type="date"
                      clearable
                      @update:model-value="validateDateRange"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="filters.dateRange.end"
                      label="结束日期"
                      type="date"
                      clearable
                      @update:model-value="validateDateRange"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-alert
                  v-if="dateError"
                  type="error"
                  density="compact"
                  class="mt-2"
                >
                  {{ dateError }}
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="applyFilters">应用筛选</v-btn>
          <v-btn color="error" @click="resetFilters">重置</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const selectedHeader = ref<typeof headers[0] | null>(null)
const showFilterDialog = ref(false)

const headers = [
  { title: '任务', key: 'code', align: 'start' as const },
  { title: '发布时间', key: 'date', align: 'start' as const },
  { title: '出版社', key: 'publisher', align: 'start' as const },
  { title: '图片数量', key: 'amount', align: 'start' as const },
  { title: '状态', key: 'status', align: 'start' as const },
]

// 完整的表头（包含操作列）
const fullHeaders = [
  ...headers,
  { title: '操作', key: 'operation', align: 'start' as const },
]

const bookData = [
  {
    code: 'crc',
    date: '2011.11',
    publisher: 'JCLR',
    amount: 20,
    status: '未完成',
    operation: '任务详情'
  },
  {
    code: 'cvf',
    date: '2025.1.1',
    publisher: 'QNMD',
    amount: 50,
    status: '已完成',
    operation: '任务详情'
  }
]

const selectHeader = (header: typeof headers[0]) => {
  selectedHeader.value = header
  searchQuery.value = '' // 清空搜索框
}

const handleSearch = () => {
  if (!selectedHeader.value || !searchQuery.value) return
}

// 筛选条件
const filters = ref({
  status: null,
  publisher: null,
  amount: null,
  dateRange: {
    start: null,
    end: null
  }
})

const dateError = ref('')

const validateDateRange = () => {
  if (filters.value.dateRange.start && filters.value.dateRange.end) {
    const startDate = new Date(filters.value.dateRange.start)
    const endDate = new Date(filters.value.dateRange.end)
    
    if (startDate > endDate) {
      dateError.value = '开始日期不能大于结束日期'
      return false
    }
  }
  dateError.value = ''
  return true
}

const filteredBookData = computed(() => {
  let filtered = bookData

  // 应用搜索过滤
  if (selectedHeader.value && searchQuery.value) {
    const key = selectedHeader.value.key
    filtered = filtered.filter(item => {
      const value = item[key as keyof typeof item]
      if (typeof value === 'number') {
        return value.toString().includes(searchQuery.value)
      }
      return value.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
    })
  }

  // 应用筛选条件
  if (filters.value.status && filters.value.status !== '全部') {
    filtered = filtered.filter(item => item.status === filters.value.status)
  }
  if (filters.value.publisher) {
    filtered = filtered.filter(item => item.publisher === filters.value.publisher)
  }
  if (filters.value.amount) {
    filtered = filtered.filter(item => item.amount >= Number(filters.value.amount))
  }
  
  // 应用日期范围筛选
  if (filters.value.dateRange.start || filters.value.dateRange.end) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date)
      const startDate = filters.value.dateRange.start ? new Date(filters.value.dateRange.start) : null
      const endDate = filters.value.dateRange.end ? new Date(filters.value.dateRange.end) : null
      
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate
      } else if (startDate) {
        return itemDate >= startDate
      } else if (endDate) {
        return itemDate <= endDate
      }
      return true
    })
  }

  return filtered
})

const getStatusColor = (status: string) => {
  switch (status) {
    case '未完成':
      return 'error'
    case '已完成':
      return 'success'
    default:
      return 'grey'
  }
}

const goToTaskDetail = (item: any) => {
  router.push(`/task/detail`)
}

const applyFilters = () => {
  if (!validateDateRange()) {
    return
  }
  showFilterDialog.value = false
}

const resetFilters = () => {
  filters.value = {
    status: null,
    publisher: null,
    amount: null,
    dateRange: {
      start: null,
      end: null
    }
  }
}
</script>

<style scoped>
.review-page {
  padding: 20px;
}

.search-input {
  max-width: 500px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
