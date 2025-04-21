<template>
  <v-container>
    <v-row>
      <!-- 统计卡片 -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="primary" dark>
          <v-card-title>总任务数</v-card-title>
          <v-card-text class="text-h4">1,234</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="success" dark>
          <v-card-title>已完成任务数</v-card-title>
          <v-card-text class="text-h4">856</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="warning" dark>
          <v-card-title>待处理任务数</v-card-title>
          <v-card-text class="text-h4">245</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="info" dark>
          <v-card-title>进行中任务数</v-card-title>
          <v-card-text class="text-h4">133</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- 活跃用户折线图 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>最近一周活跃用户数量</v-card-title>
          <v-card-text>
            <div ref="userChart" style="height: 300px"></div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 图片造假类型饼图 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>图片造假类型占比</v-card-title>
          <v-card-text>
            <div ref="fraudChart" style="height: 300px"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- 任务数量柱状图 -->
      <v-col cols="12">
        <v-card>
          <v-card-title>最近一周任务统计</v-card-title>
          <v-card-text>
            <div ref="taskChart" style="height: 300px"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Analytics',
  mounted() {
    this.initUserChart()
    this.initFraudChart()
    this.initTaskChart()
  },
  methods: {
    initUserChart() {
      const chart = echarts.init(this.$refs.userChart)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['出版社', '审稿人']
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '出版社',
            type: 'line',
            data: [12, 15, 18, 14, 16, 10, 13]
          },
          {
            name: '审稿人',
            type: 'line',
            data: [8, 10, 12, 9, 11, 7, 9]
          }
        ]
      }
      chart.setOption(option)
    },
    initFraudChart() {
      const chart = echarts.init(this.$refs.fraudChart)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 35, name: '美化修饰' },
              { value: 25, name: '背景掩盖' },
              { value: 20, name: '复制伪造' },
              { value: 15, name: '软件修改' },
              { value: 5, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    },
    initTaskChart() {
      const chart = echarts.init(this.$refs.taskChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['下发人工审核', '完成人工审核', 'AI检测']
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '下发人工审核',
            type: 'bar',
            data: [15, 18, 20, 16, 19, 12, 14]
          },
          {
            name: '完成人工审核',
            type: 'bar',
            data: [12, 15, 17, 14, 16, 10, 12]
          },
          {
            name: 'AI检测',
            type: 'bar',
            data: [25, 28, 30, 26, 29, 22, 24]
          }
        ]
      }
      chart.setOption(option)
    }
  }
}
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
</style>
