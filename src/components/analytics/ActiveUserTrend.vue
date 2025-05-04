<template>
    <v-card class="chart-card" elevation="2">
        <v-card-title class="text-h6 font-weight-medium primary--text">
            <v-icon color="primary" class="mr-2">mdi-account-multiple</v-icon>
            日活跃用户趋势
        </v-card-title>
        <v-card-text>
            <div ref="chartRef" class="chart-container"></div>
        </v-card-text>
    </v-card>
</template>
  
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import analyticsApi from '@/api/analytics'
import { useSnackbarStore } from '@/stores/snackbar'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const snackbar = useSnackbarStore()

const fetchChartData = async () => {
    try {
        const res = await analyticsApi.getDailyActiveUsers()
        const data = res.data

        const dates = data.map((item: any) => item.date)
        const publishers = data.map((item: any) => item.publisher_count)
        const reviewers = data.map((item: any) => item.reviewer_count)

        renderChart({ dates, publishers, reviewers })
    } catch (err) {
        console.error('加载活跃用户数据失败:', err)
        snackbar.showMessage('加载活跃用户数据失败')
    }
}

const renderChart = (data: {
    dates: string[]
    publishers: number[]
    reviewers: number[]
}) => {
    if (!chartRef.value) return

    if (chartInstance) chartInstance.dispose()
    chartInstance = echarts.init(chartRef.value)

    const option: echarts.EChartsOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: { color: '#333' },
            padding: 12,
            extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
            axisPointer: {
                type: 'line',
                lineStyle: { color: '#aaa', width: 1 }
            }
        },
        legend: {
            data: ['发布者', '审核人'],
            top: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '5%',
            top: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.dates,
            boundaryGap: false,
            axisLabel: {
                interval: 0,
                rotate: 30,
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: '人数',
            axisLabel: { formatter: '{value}人' }
        },
        series: [
            {
                name: '发布者',
                type: 'line',
                data: data.publishers,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { width: 3 },
                itemStyle: { color: '#3f51b5' }
            },
            {
                name: '审核人',
                type: 'line',
                data: data.reviewers,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { width: 3 },
                itemStyle: { color: '#4caf50' }
            }
        ]
    }

    chartInstance.setOption(option)
}

const handleResize = () => {
    chartInstance?.resize()
}

onMounted(() => {
    fetchChartData()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    chartInstance?.dispose()
    chartInstance = null
    window.removeEventListener('resize', handleResize)
})
</script>
  
<style scoped>
.chart-card {
    border-radius: 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chart-container {
    width: 100%;
    height: 400px;
}

@media (max-width: 600px) {
    .chart-container {
        height: 300px;
    }
}
</style>
  