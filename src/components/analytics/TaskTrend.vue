<template>
  <v-card class="chart-card" elevation="2">
    <v-card-title class="text-h5 font-weight-bold primary--text py-4">
      <v-icon large color="primary" class="mr-2">mdi-chart-line</v-icon>
      任务数量趋势
    </v-card-title>
    <v-card-text>
      <div ref="taskLineChart" class="chart-wrapper"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import analyticsApi from '@/api/analytics'
import { useSnackbarStore } from '@/stores/snackbar'

const taskLineChart = ref<HTMLElement | null>(null)
const taskLineChartInstance = ref<echarts.ECharts | null>(null)
const snackbar = useSnackbarStore()

const handleResize = () => {
  if (taskLineChartInstance.value && taskLineChart.value) {
    taskLineChartInstance.value.resize()
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

const fetchTaskTrendData = async () => {
  try {
    const [taskCountRes, reviewRequestRes, completedReviewRes] = await Promise.all([
      analyticsApi.getDailyTaskCount(),
      analyticsApi.getDailyReviewRequestCount(),
      analyticsApi.getDailyCompletedManualReviewCount()
    ])

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

onMounted(() => {
  initTaskLineChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (taskLineChartInstance.value) {
    taskLineChartInstance.value.dispose()
    taskLineChartInstance.value = null
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