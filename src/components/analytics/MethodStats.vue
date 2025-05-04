<template>
  <v-card class="chart-card" elevation="2">
    <v-card-title class="text-h5 font-weight-bold primary--text py-4">
      <v-icon large color="primary" class="mr-2">mdi-chart-bar</v-icon>
      各学科检测方法使用频率
    </v-card-title>
    <v-card-text>
      <div ref="methodStatsChart" class="chart-wrapper"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import analyticsApi from '@/api/analytics'
import { useSnackbarStore } from '@/stores/snackbar'

const methodStatsChart = ref<HTMLElement | null>(null)
const methodStatsChartInstance = ref<echarts.ECharts | null>(null)
const snackbar = useSnackbarStore()

const handleResize = () => {
  if (methodStatsChartInstance.value && methodStatsChart.value) {
    methodStatsChartInstance.value.resize()
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
  initMethodStatsChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (methodStatsChartInstance.value) {
    methodStatsChartInstance.value.dispose()
    methodStatsChartInstance.value = null
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