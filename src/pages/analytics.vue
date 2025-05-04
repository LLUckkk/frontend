<template>
  <v-container class="analytics-container">
    <v-row>
      <v-col cols="12" md="6">
        <ImageTagStats />
      </v-col>

      <v-col cols="12" md="6">
        <PublisherRanking />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <TaskTrend />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <ActiveUserTrend />
      </v-col>
    </v-row>

    <!-- <v-row class="mt-4">
      <v-col cols="12">
        <MethodStats />
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script setup lang="ts">
import ImageTagStats from '@/components/analytics/ImageTagStats.vue'
import PublisherRanking from '@/components/analytics/PublisherRanking.vue'
import TaskTrend from '@/components/analytics/TaskTrend.vue'
import ActiveUserTrend from '@/components/analytics/ActiveUserTrend.vue'
import MethodStats from '@/components/analytics/MethodStats.vue'
</script>

<style scoped>
.analytics-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 600px) {
  .analytics-container {
    padding: 12px;
  }
}
</style>
