<template>
  <v-snackbar
    v-model="show"
    :color="type"
    :timeout="timeout"
    location="top"
    class="app-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="icon"
        class="mr-2"
      ></v-icon>
      <span>{{ message }}</span>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="show = false"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
const timeout = ref(5000)

const icon = computed(() => {
  switch (type.value) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-information'
  }
})

const open = (msg: string, msgType: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
  message.value = msg
  type.value = msgType
  timeout.value = duration
  show.value = true
}

defineExpose({
  open
})
</script>

<style scoped>
.app-snackbar {
  z-index: 1000;
}

.app-snackbar :deep(.v-snackbar__content) {
  padding: 8px 16px;
}

.app-snackbar :deep(.v-snackbar__wrapper) {
  min-width: 200px;
  max-width: 400px;
}
</style> 