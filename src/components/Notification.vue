<template>
  <div>
    <v-menu v-model="menu" location="bottom end" offset-y>
      <template #activator="{ props }">
        <v-badge :content="messageStore.notifications.length" color="red" v-if="messageStore.notifications.length > 0"
          :max="99">
          <v-btn icon v-bind="props">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
        </v-badge>
        <v-btn icon v-else v-bind="props">
          <v-icon>mdi-bell</v-icon>
        </v-btn>
      </template>

      <v-card width="300">
        <v-card-title class="text-subtitle-1 font-weight-bold">通知</v-card-title>
        <v-divider />
        <v-list>
          <template v-if="messageStore.notifications.length > 0">
            <v-list-item v-for="(item, index) in messageStore.notifications" :key="index" :title="item.message"
              density="comfortable">
              <template #prepend>
                <v-icon color="primary">mdi-information</v-icon>
              </template>
            </v-list-item>
          </template>
          <v-list-item v-else>
            <v-list-item-title class="text-grey">暂无通知</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-card-actions>
          <v-btn text class="ms-auto" @click="clear">清空</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessageStore } from '@/stores/message' // 假设你使用 Pinia 管理通知

const menu = ref(false)
const messageStore = useMessageStore()



onMounted(() => {
  console.log(messageStore.notifications)
})



const clear = () => {
  messageStore.clearNotifications()
}
</script>
