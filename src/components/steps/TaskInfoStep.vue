<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="taskInfo.name"
          label="标题"
          placeholder="请输入标题"
          variant="outlined"
          hide-details
          class="mb-4"
          @update:model-value="emitUpdate"
        ></v-text-field>
        
        <v-textarea
          v-model="taskInfo.description"
          label="描述"
          placeholder="请输入描述"
          variant="outlined"
          hide-details
          class="mb-4"
          rows="3"
          @update:model-value="emitUpdate"
        ></v-textarea>

        <div class="d-flex align-center mb-4">
          <v-chip
            v-for="tag in taskInfo.tags"
            :key="tag"
            class="mr-2"
            closable
            @click:close="removeTag(tag)"
          >
            {{ tag }}
          </v-chip>
          <v-btn
            variant="text"
            prepend-icon="mdi-plus"
            @click="showTagDialog = true"
          >
            添加标签
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 添加标签对话框 -->
    <v-dialog v-model="showTagDialog" max-width="400">
      <v-card>
        <v-card-title>添加标签</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTag"
            label="标签名称"
            placeholder="请输入标签名称"
            variant="outlined"
            hide-details
            @keyup.enter="addTag"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showTagDialog = false">取消</v-btn>
          <v-btn color="primary" @click="addTag" :disabled="!newTag">添加</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface TaskInfo {
  name: string
  description: string
  tags: string[]
}

const emit = defineEmits<{
  (e: 'update', value: TaskInfo): void
}>()

const taskInfo = reactive<TaskInfo>({
  name: '',
  description: '',
  tags: []
})

const showTagDialog = ref(false)
const newTag = ref('')

const addTag = () => {
  if (newTag.value && !taskInfo.tags.includes(newTag.value)) {
    taskInfo.tags.push(newTag.value)
    emitUpdate()
  }
  newTag.value = ''
  showTagDialog.value = false
}

const removeTag = (tag: string) => {
  taskInfo.tags = taskInfo.tags.filter(t => t !== tag)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update', { ...taskInfo })
}
</script> 