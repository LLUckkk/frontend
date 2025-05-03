<template>
  <v-container class="analytics-container">
    <v-row >
      <!-- 图像标签统计部分 -->
      <v-col cols="12" md="6">
        <v-card class="mb-6 chart-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold primary--text py-4">
            <v-icon large color="primary" class="mr-2">mdi-chart-pie</v-icon>
            图像标签统计分析
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col  sm="5">
                <v-text-field
                  v-model="startTime"
                  label="开始时间"
                  type="datetime-local"
                  hide-details="auto"
                  density="compact"
                  :error-messages="startTimeError"
                  class="rounded-lg"
                  variant="outlined"
                  @update:model-value="validateTime"
                  required
                />
              </v-col>
              <v-col sm="5">
                <v-text-field
                  v-model="endTime"
                  label="结束时间"
                  type="datetime-local"
                  hide-details="auto"
                  density="compact"
                  :error-messages="endTimeError"
                  class="rounded-lg"
                  variant="outlined"
                  @update:model-value="validateTime"
                  required
                />
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn
                  color="primary"
                  @click="fetchChartData"
                  :disabled="!!timeError || !startTime || !endTime"
                  prepend-icon="mdi-refresh"
                >
                </v-btn>
              </v-col>
            </v-row>
            <div ref="chartContainer" class="chart-wrapper"></div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 用户排行榜部分 -->
      <v-col cols="12" md="6">
        <v-card class="mb-6 chart-card scrollable-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold primary--text py-4 sticky-header">
            <v-icon large color="primary" class="mr-2">mdi-account-group</v-icon>
            出版社排行榜
          </v-card-title>
          <v-card-text class="pa-4">
            <v-table class="publisher-table">
              <thead>
                <tr>
                  <th class="text-left">排名</th>
                  <th class="text-left">用户名</th>
                  <th class="text-right">总任务数</th>
                  <th class="text-right">总图片数</th>
                  <th class="text-right">造假数量</th>
                  <th class="text-right">造假比例</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(publisher, index) in publishers" :key="publisher.username">
                  <td>{{ index + 1 }}</td>
                  <td>{{ publisher.username }}</td>
                  <td class="text-right">{{ publisher.total_tasks }}</td>
                  <td class="text-right">{{ publisher.total_images }}</td>
                  <td class="text-right">{{ publisher.fake_count }}</td>
                  <td class="text-right">
                    <v-chip :color="getFakeRatioColor(publisher.fake_ratio)" text-color="white" size="small">
                      {{ (publisher.fake_ratio * 100).toFixed(1) }}%
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="chart-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold primary--text py-4">
            <v-icon large color="primary" class="mr-2">mdi-chart-line</v-icon>
            任务数量趋势
          </v-card-title>
          <v-card-text>
            <div ref="taskLineChart" class="chart-wrapper"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="chart-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold primary--text py-4">
            <v-icon large color="primary" class="mr-2">mdi-account-multiple</v-icon>
            日活跃用户趋势
          </v-card-title>
          <v-card-text>
            <div ref="activeUserLineChart" class="chart-wrapper"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="chart-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold primary--text py-4">
            <v-icon large color="primary" class="mr-2">mdi-chart-bar</v-icon>
            各学科检测方法使用频率
          </v-card-title>
          <v-card-text>
            <div ref="methodStatsChart" class="chart-wrapper"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import analyticsApi from '@/api/analytics'
import { useSnackbarStore } from '@/stores/snackbar'

const startTime = ref<string | null>(null)
const endTime = ref<string | null>(null)
const startTimeError = ref('')
const endTimeError = ref('')
const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)
const publishers = ref<any[]>([])
const taskLineChart = ref<HTMLElement | null>(null)
const taskLineChartInstance = ref<echarts.ECharts | null>(null)
const activeUserLineChart = ref<HTMLElement | null>(null)
const activeUserLineChartInstance = ref<echarts.ECharts | null>(null)
const methodStatsChart = ref<HTMLElement | null>(null)
const methodStatsChartInstance = ref<echarts.ECharts | null>(null)

// 添加测试数据
const exampleData = {
  "Biology": 0,
  "Medicine": 0,
  "Chemistry": 2,
  "Graphics": 3,
  "Other": 0
}


// 添加测试数据
const exampleData1 = {
  "Biology": 1,
  "Medicine": 0,
  "Chemistry": 2,
  "Graphics": 3,
  "Other": 0
}


const timeError = computed(() => startTimeError.value || endTimeError.value)

const formatDateTime = (date: Date): string => date.toISOString().slice(0, 16)

const initDefaultTime = () => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 1)
  endTime.value = formatDateTime(end)
  startTime.value = formatDateTime(start)
}

const validateTime = () => {
  startTimeError.value = ''
  endTimeError.value = ''
  if (!startTime.value) {
    startTimeError.value = '请选择开始时间'
    return false
  }
  if (!endTime.value) {
    endTimeError.value = '请选择结束时间'
    return false
  }
  const start = new Date(startTime.value)
  const end = new Date(endTime.value)
  if (start > end) {
    startTimeError.value = '开始时间不能大于结束时间'
    return false
  }
  return true
}

const handleResize = () => {
  try {
    if (chart.value && chartContainer.value) {
      chart.value.resize()
    }
    if (taskLineChartInstance.value && taskLineChart.value) {
      taskLineChartInstance.value.resize()
    }
    if (activeUserLineChartInstance.value && activeUserLineChart.value) {
      activeUserLineChartInstance.value.resize()
    }
    if (methodStatsChartInstance.value && methodStatsChart.value) {
      methodStatsChartInstance.value.resize()
    }
  } catch (error) {
    console.error('图表缩放错误:', error)
    // 如果发生错误，重新初始化图表
    initCharts()
  }
}

const initCharts = () => {
  initChart()
  initTaskLineChart()
  initActiveUserLineChart()
  initMethodStatsChart()
}

const initChart = () => {
  if (chartContainer.value) {
    try {
      if (chart.value) {
        chart.value.dispose()
      }
      chart.value = echarts.init(chartContainer.value)
      updateChart(exampleData)
    } catch (error) {
      console.error('初始化饼图失败:', error)
    }
  }
}

const initTaskLineChart = () => {
  if (taskLineChart.value) {
    try {
      if (taskLineChartInstance.value) {
        taskLineChartInstance.value.dispose()
      }
      taskLineChartInstance.value = echarts.init(taskLineChart.value)
      fetchTaskTrendData()
    } catch (error) {
      console.error('初始化任务趋势图失败:', error)
    }
  }
}

const initActiveUserLineChart = () => {
  if (activeUserLineChart.value) {
    try {
      if (activeUserLineChartInstance.value) {
        activeUserLineChartInstance.value.dispose()
      }
      activeUserLineChartInstance.value = echarts.init(activeUserLineChart.value)
      fetchActiveUserData()
    } catch (error) {
      console.error('初始化活跃用户图失败:', error)
    }
  }
}

const initMethodStatsChart = () => {
  if (methodStatsChart.value) {
    try {
      if (methodStatsChartInstance.value) {
        methodStatsChartInstance.value.dispose()
      }
      methodStatsChartInstance.value = echarts.init(methodStatsChart.value)
      fetchMethodStats()
    } catch (error) {
      console.error('初始化方法统计图失败:', error)
    }
  }
}

const updateChart = (data: Record<string, number>) => {
  console.log(data)
  if (!chart.value) return

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: Number(value)
  }))

  const colorPalette = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#c23531'
  ]

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const total = chartData.reduce((sum, item) => sum + item.value, 0)
        const percentage = ((params.value / total) * 100).toFixed(1)
        return `
          <div style="font-weight: bold; margin-bottom: 8px;">${params.name}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #666;">数量：</span>
            <span style="font-weight: bold;">${params.value}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #666;">占比：</span>
            <span style="font-weight: bold;">${percentage}%</span>
          </div>
        `
      },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'middle',
      textStyle: {
        color: '#666',
        fontSize: 12
      },
      pageButtonPosition: 'end',
      pageIconColor: '#666',
      pageIconInactiveColor: '#ccc',
      pageTextStyle: {
        color: '#666'
      }
    },
    series: [
      {
        name: '标签数量',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} ({d}%)',
          fontSize: 12,
          color: '#444',
          lineHeight: 16,
          rich: {
            b: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#333'
            },
            c: {
              fontSize: 11,
              color: '#666'
            }
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#aaa',
            width: 1
          },
          smooth: 0.2
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: chartData,
        color: colorPalette
      }
    ]
  }

  chart.value.setOption(option)
}

const getFakeRatioColor = (ratio: number): string => {
  if (ratio >= 0.5) return 'error'
  if (ratio >= 0.3) return 'warning'
  if (ratio >= 0.1) return 'info'
  return 'success'
}

const snackbar = useSnackbarStore()

const fetchChartData = async () => {
  if (!validateTime()) return
  try {
    const params = {
      startTime: startTime.value!.replace('T', ' '),
      endTime: endTime.value!.replace('T', ' ')
    }
    // 调用后端接口获取数据
    const tagResponse = await analyticsApi.getImgTag(params)
    console.log(tagResponse.data)
    if (tagResponse.data) {
      updateChart(tagResponse.data)
    }
  } catch (error) {
    snackbar.showMessage('获取图表数据失败')
  }
}


const fetchPublishersData = async () => {
  if (!validateTime()) return
  try {
    const params = {
      startTime: startTime.value!.replace('T', ' '),
      endTime: endTime.value!.replace('T', ' ')
    }
    // 调用后端接口获取数据
    const res = await analyticsApi.getTopPublishers()
    if (res.data && Array.isArray(res.data)) {
      publishers.value = res.data.map(p => ({
        ...p,
        fake_ratio: p.fake_count / (p.total_images || 1)
      }))
      publishers.value.push(...res.data.map(p => ({
        ...p,
        fake_ratio: p.fake_count / (p.total_images || 1)
      })))
      
      publishers.value.push(...res.data.map(p => ({
        ...p,
        fake_ratio: p.fake_count / (p.total_images || 1)
      })))

    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
  }
}

const fetchTaskTrendData = async () => {
  try {
    // 并行调用三个接口
    const [taskCountRes, reviewRequestRes, completedReviewRes] = await Promise.all([
      analyticsApi.getDailyTaskCount(),
      analyticsApi.getDailyReviewRequestCount(),
      analyticsApi.getDailyCompletedManualReviewCount()
    ])

    // 处理数据
    const dates = taskCountRes.data.map((item: any) => item.date)
    const taskCount = taskCountRes.data.map((item: any) => item.task_count)
    const reviewRequestCount = reviewRequestRes.data.map((item: any) => item.review_request_count)
    const completedManualReviewCount = completedReviewRes.data.map((item: any) => item.completed_manual_review_count)

    renderTaskLineChart({
      dates,
      taskCount,
      reviewRequestCount,
      completedManualReviewCount
    })
  } catch (error) {
    console.error('获取任务趋势数据失败:', error)
    snackbar.showMessage('获取任务趋势数据失败')
  }
}

const renderTaskLineChart = (data: {
  dates: string[],
  taskCount: number[],
  reviewRequestCount: number[],
  completedManualReviewCount: number[]
}) => {
  if (!taskLineChart.value) return
  if (taskLineChartInstance.value) {
    taskLineChartInstance.value.dispose()
  }
  taskLineChartInstance.value = echarts.init(taskLineChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      formatter: function(params: any) {
        const date = params[0].axisValue
        let result = `
          <div style="font-weight: bold; margin-bottom: 8px;">${date}</div>
        `
        params.forEach((param: any) => {
          result += `
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span style="color: #666;">${param.seriesName}：</span>
              <span style="font-weight: bold;">${param.value}</span>
            </div>
          `
        })
        return result
    },
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: '#ddd',
    borderWidth: 1,
    textStyle: {
      color: '#333',
      fontSize: 13
    },
    padding: [12, 16],
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;'
  },
    legend: {
      data: ['任务下发数', '人工审核请求数', '完成人工审核数'],
      top: 20,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '数量',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      }
    },
    series: [
      {
        name: '任务下发数',
        type: 'bar',
        data: data.taskCount,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '人工审核请求数',
        type: 'bar',
        data: data.reviewRequestCount,
        itemStyle: {
          color: '#91cc75'
        }
      },
      {
        name: '完成人工审核数',
        type: 'bar',
        data: data.completedManualReviewCount,
        itemStyle: {
          color: '#fac858'
        }
      }
    ]
  }
  
  taskLineChartInstance.value.setOption(option)
}

const fetchActiveUserData = async () => {
  try {
    const res = await analyticsApi.getDailyActiveUsers()
    if (res.data) {
      renderActiveUserLineChart(res.data)
    }
  } catch (error) {
    console.error('获取活跃用户数据失败:', error)
    snackbar.showMessage('获取活跃用户数据失败')
  }
}

const renderActiveUserLineChart = (data: Array<{
  date: string,
  publisher_count: number,
  reviewer_count: number
}>) => {
  if (!activeUserLineChart.value) return
  if (activeUserLineChartInstance.value) {
    activeUserLineChartInstance.value.dispose()
  }
  activeUserLineChartInstance.value = echarts.init(activeUserLineChart.value)
  
  const dates = data.map(item => item.date)
  const publisherCount = data.map(item => item.publisher_count)
  const reviewerCount = data.map(item => item.reviewer_count)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)',
          width: 1
        }
      },
      formatter: function(params: any) {
        const date = params[0].axisValue
        let result = `
          <div style="font-weight: bold; margin-bottom: 8px;">${date}</div>
        `
        params.forEach((param: any) => {
          result += `
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span style="color: #666;">${param.seriesName}：</span>
              <span style="font-weight: bold;">${param.value}人</span>
            </div>
          `
        })
        return result
      },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;'
    },
    legend: {
      data: ['发布者', '审核人'],
      top: 20,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      },
      axisLabel: {
        formatter: '{value}人'
      }
    },
    series: [
      {
        name: '发布者',
        type: 'line',
        data: publisherCount,
        itemStyle: {
          color: '#5470c6'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '审核人',
        type: 'line',
        data: reviewerCount,
        itemStyle: {
          color: '#91cc75'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
  
  activeUserLineChartInstance.value.setOption(option)
}

const fetchMethodStats = async () => {
  try {
    const res = await analyticsApi.getDetectionMethodStats()
    if (res.data) {
      renderMethodStatsChart(res.data)
    }
  } catch (error) {
    console.error('获取检测方法统计数据失败:', error)
    snackbar.showMessage('获取检测方法统计数据失败')
  }
}

const renderMethodStatsChart = (data: Record<string, Record<string, number>>) => {
  if (!methodStatsChart.value) return
  if (methodStatsChartInstance.value) {
    methodStatsChartInstance.value.dispose()
  }
  methodStatsChartInstance.value = echarts.init(methodStatsChart.value)

  const methodList = Array.from({ length: 7 }, (_, i) => `Method-${i + 1}`)

  const colorPalette = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452'
  ]

  const series = methodList.map((method, index) => ({
    name: method,
    type: 'bar',
    stack: 'total',
    emphasis: {
      focus: 'series',
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    data: Object.keys(data).map(tag => {
      const tagData = data[tag]
      const total = tagData.total || 1
      return {
        value: tagData[method] || 0,
        percent: ((tagData[method] || 0) / total * 100).toFixed(1) + '%'
      }
    }),
    itemStyle: {
      color: colorPalette[index]
    }
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      formatter: function(params: any) {
        const category = params[0].axisValue
        let result = `
          <div style="font-weight: bold; margin-bottom: 8px;">${category}</div>
        `
        params.forEach((param: any) => {
          result += `
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span style="color: #666;">${param.seriesName}：</span>
              <span style="font-weight: bold;">${param.data.value} (${param.data.percent})</span>
            </div>
          `
        })
        return result
      },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;'
    },
    legend: {
      data: methodList,
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        fontSize: 12
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      padding: [10, 0],
      formatter: function(name: string) {
        return name.length > 8 ? name.slice(0, 8) + '...' : name
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Object.keys(data),
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '使用次数',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      }
    },
    series: series
  }

  methodStatsChartInstance.value.setOption(option)
}

onMounted(() => {
  initDefaultTime()
  initCharts()
  fetchPublishersData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  try {
    if (chart.value) {
      chart.value.dispose()
      chart.value = null
    }
    if (taskLineChartInstance.value) {
      taskLineChartInstance.value.dispose()
      taskLineChartInstance.value = null
    }
    if (activeUserLineChartInstance.value) {
      activeUserLineChartInstance.value.dispose()
      activeUserLineChartInstance.value = null
    }
    if (methodStatsChartInstance.value) {
      methodStatsChartInstance.value.dispose()
      methodStatsChartInstance.value = null
    }
  } catch (error) {
    console.error('销毁图表失败:', error)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.analytics-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.chart-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.chart-wrapper {
  width: 100%;
  height: 400px;
}

.scrollable-card {
  overflow-y: auto;
  max-height: 600px;
}

.scrollable-card::-webkit-scrollbar {
  width: 6px;
}

.scrollable-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-card::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.scrollable-card::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.publisher-table {
  width: 100%;
}

.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 16px 24px;
}

@media (max-width: 600px) {
  .analytics-container {
    padding: 12px;
  }
  
  .chart-wrapper {
    height: 300px;
  }

  .scrollable-card {
    max-height: 400px;
  }
}
</style>
