<template>
  <v-card class="pa-6" elevation="1">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-h5">Tasks</div>
      <v-btn color="primary" variant="outlined" @click="addTask">
        <v-icon start>mdi-plus</v-icon>
        Add Task
      </v-btn>
    </div>

    <div v-if="!localTasks.length" class="text-center text-grey pa-8">
      Start adding tasks to your cognitive walkthrough
    </div>

    <v-expansion-panels v-else v-model="expanded" variant="accordion">
      <v-expansion-panel
        v-for="(task, tIndex) in localTasks"
        :key="task.id"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center w-100">
            <v-chip size="small" color="brown" class="mr-3">
              T{{ tIndex + 1 }}
            </v-chip>
            <span class="font-weight-medium">
              {{ task.title || 'Untitled Task' }}
            </span>
            <v-spacer />
            <span class="text-caption text-grey mr-4">
              {{ task.steps?.length || 0 }} steps
            </span>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="task.title"
                label="Task Title"
                variant="outlined"
                density="compact"
                @update:model-value="emitUpdate"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="task.description"
                label="Task Description"
                variant="outlined"
                density="compact"
                @update:model-value="emitUpdate"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 mb-2">Steps</div>

          <v-table v-if="task.steps?.length" density="compact">
            <thead>
              <tr>
                <th width="50">#</th>
                <th>User Action</th>
                <th>Expected Response</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(step, sIndex) in task.steps" :key="step.id">
                <td>{{ sIndex + 1 }}</td>
                <td>
                  <v-text-field
                    v-model="step.action"
                    variant="plain"
                    density="compact"
                    hide-details
                    placeholder="What the user does..."
                    @update:model-value="emitUpdate"
                  />
                </td>
                <td>
                  <v-text-field
                    v-model="step.expectedResponse"
                    variant="plain"
                    density="compact"
                    hide-details
                    placeholder="What should happen..."
                    @update:model-value="emitUpdate"
                  />
                </td>
                <td>
                  <v-btn
                    icon="mdi-delete"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="removeStep(tIndex, sIndex)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="d-flex justify-space-between mt-3">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="addStep(tIndex)"
            >
              <v-icon start>mdi-plus</v-icon>
              Add Step
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="removeTask(tIndex)"
            >
              <v-icon start>mdi-delete</v-icon>
              Remove Task
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:tasks'])

const localTasks = ref([...props.tasks])
const expanded = ref(null)
let nextId = 100

watch(
  () => props.tasks,
  (val) => {
    localTasks.value = [...val]
  },
)

const emitUpdate = () => {
  emit('update:tasks', [...localTasks.value])
}

const addTask = () => {
  localTasks.value.push({
    id: nextId++,
    title: '',
    description: '',
    steps: [],
  })
  expanded.value = localTasks.value.length - 1
  emitUpdate()
}

const removeTask = (index) => {
  localTasks.value.splice(index, 1)
  emitUpdate()
}

const addStep = (taskIndex) => {
  if (!localTasks.value[taskIndex].steps) {
    localTasks.value[taskIndex].steps = []
  }
  localTasks.value[taskIndex].steps.push({
    id: nextId++,
    action: '',
    expectedResponse: '',
  })
  emitUpdate()
}

const removeStep = (taskIndex, stepIndex) => {
  localTasks.value[taskIndex].steps.splice(stepIndex, 1)
  emitUpdate()
}
</script>
