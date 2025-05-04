<template>
    <v-card class="chart-card" elevation="3">
        <v-card-title class="text-h6 font-weight-medium primary--text">
            <v-icon color="primary" class="mr-2">mdi-chart-bar</v-icon>
            任务数量趋势
        </v-card-title>
        <v-card-text>
            <div ref="barChartRef" class="chart-container"></div>
        </v-card-text>
    </v-card>
</template>
  
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import analyticsApi from '@/api/analytics'
import { useSnackbarStore } from '@/stores/snackbar'

const barChartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const snackbar = useSnackbarStore()

const fetchAndRenderChart = async () => {
    try {
        const [taskCountRes, reviewRequestRes, completedReviewRes] = await Promise.all([
            analyticsApi.getDailyTaskCount(),
            analyticsApi.getDailyReviewRequestCount(),
            analyticsApi.getDailyCompletedManualReviewCount()
        ])

        const dates = taskCountRes.data.map((item: any) => item.date)
        const taskCount = taskCountRes.data.map((item: any) => item.task_count)
        const reviewRequestCount = reviewRequestRes.data.map((item: any) => item.review_request_count)
        const completedManualReviewCount = completedReviewRes.data.map((item: any) => item.manual_review_count)

        renderChart({ dates, taskCount, reviewRequestCount, completedManualReviewCount })
    } catch (error) {
        console.error('获取任务数据失败:', error)
        snackbar.showMessage('获取任务数据失败')
    }
}

const renderChart = (data: {
    dates: string[]
    taskCount: number[]
    reviewRequestCount: number[]
    completedManualReviewCount: number[]
}) => {
    if (!barChartRef.value) return

    if (chartInstance) {
        chartInstance.dispose()
    }

    chartInstance = echarts.init(barChartRef.value)

    const option: echarts.EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            top: 10,
            data: ['任务下发数', '人工审核请求数', '完成人工审核数']
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
            name: '数量'
        },
        series: [
            {
                name: '任务下发数',
                type: 'bar',
                data: data.taskCount,
                itemStyle: { color: '#42A5F5' }
            },
            {
                name: '人工审核请求数',
                type: 'bar',
                data: data.reviewRequestCount,
                itemStyle: { color: '#66BB6A' }
            },
            {
                name: '完成人工审核数',
                type: 'bar',
                data: data.completedManualReviewCount,
                itemStyle: { color: '#FFA726' }
            }
        ]
    }

    chartInstance.setOption(option)
}

const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize()
    }
}

onMounted(() => {
    fetchAndRenderChart()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
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
  