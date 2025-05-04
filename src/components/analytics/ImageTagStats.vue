<template>
  <v-card class="mb-6 chart-card" elevation="2">
    <v-card-title class="text-h5 font-weight-bold primary--text py-4">
      <v-icon large color="primary" class="mr-2">mdi-chart-pie</v-icon>
      图像标签统计分析
    </v-card-title>
    <v-card-text class="pa-4">
      <v-row>
        <v-col sm="5">
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
const snackbar = useSnackbarStore()

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
  if (chart.value && chartContainer.value) {
    chart.value.resize()
  }
}

const initChart = () => {
  if (chartContainer.value) {
    try {
      if (chart.value) {
        chart.value.dispose()
      }
      chart.value = echarts.init(chartContainer.value)
      fetchChartData()
    } catch (error) {
      console.error('初始化饼图失败:', error)
    }
  }
}

const updateChart = (data: Record<string, number>) => {
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

const fetchChartData = async () => {
  if (!validateTime()) return
  try {
    const params = {
      startTime: startTime.value!.replace('T', ' '),
      endTime: endTime.value!.replace('T', ' ')
    }
    const tagResponse = await analyticsApi.getImgTag(params)
    if (tagResponse.data) {
      updateChart(tagResponse.data)
    }
  } catch (error) {
    snackbar.showMessage('获取图表数据失败')
  }
}

onMounted(() => {
  initDefaultTime()
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose()
    chart.value = null
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