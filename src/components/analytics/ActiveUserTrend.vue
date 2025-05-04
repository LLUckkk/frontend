<template>
  <v-card class="chart-card" elevation="2">
    <v-card-title class="text-h5 font-weight-bold primary--text py-4">
      <v-icon large color="primary" class="mr-2">mdi-account-multiple</v-icon>
      日活跃用户趋势
    </v-card-title>
    <v-card-text>
      <div ref="activeUserLineChart" class="chart-wrapper"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import analyticsApi from '@/api/analytics'
import { useSnackbarStore } from '@/stores/snackbar'

const activeUserLineChart = ref<HTMLElement | null>(null)
const activeUserLineChartInstance = ref<echarts.ECharts | null>(null)
const snackbar = useSnackbarStore()

const handleResize = () => {
  if (activeUserLineChartInstance.value && activeUserLineChart.value) {
    activeUserLineChartInstance.value.resize()
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

onMounted(() => {
  initActiveUserLineChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (activeUserLineChartInstance.value) {
    activeUserLineChartInstance.value.dispose()
    activeUserLineChartInstance.value = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
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

@media (max-width: 600px) {
  .chart-wrapper {
    height: 300px;
  }
}
</style> 