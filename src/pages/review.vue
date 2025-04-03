<template>
  <div class="review-page">
    <v-container>
      <!-- 标题 -->
      <v-row class="mb-6">
        <v-col>
          <h1 class="text-h4 font-weight-bold">我的任务</h1>
        </v-col>
      </v-row>

      <!-- 搜索栏 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const selectedHeader = ref<typeof headers[0] | null>(null)

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

const filteredBookData = computed(() => {
  if (!selectedHeader.value || !searchQuery.value) return bookData
  
  const key = selectedHeader.value.key
  return bookData.filter(item => {
    const value = item[key as keyof typeof item]
    if (typeof value === 'number') {
      return value.toString().includes(searchQuery.value)
    }
    return value.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
  })
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
