<template>
  <v-card class="pa-6" elevation="1">
    <div class="text-h5 mb-4">Walkthrough Results</div>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card color="success" variant="tonal" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">{{ passRate }}%</div>
          <div class="text-subtitle-2">Overall Pass Rate</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="error" variant="tonal" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">{{ totalFailures }}</div>
          <div class="text-subtitle-2">Total Failures</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="info" variant="tonal" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">{{ totalSteps }}</div>
          <div class="text-subtitle-2">Steps Evaluated</div>
        </v-card>
      </v-col>
    </v-row>

    <div class="text-h6 mb-3">Findings by Task</div>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="(task, tIndex) in taskResults"
        :key="tIndex"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center w-100">
            <v-chip size="small" color="brown" class="mr-3">
              T{{ tIndex + 1 }}
            </v-chip>
            <span>{{ task.title }}</span>
            <v-spacer />
            <v-chip
              :color="task.passRate === 100 ? 'success' : 'warning'"
              size="small"
              class="mr-2"
            >
              {{ task.passRate }}% pass
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Step</th>
                <th>Q1</th>
                <th>Q2</th>
                <th>Q3</th>
                <th>Q4</th>
                <th>Result</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(step, sIndex) in task.steps" :key="sIndex">
                <td>{{ sIndex + 1 }}. {{ step.action }}</td>
                <td>
                  <v-icon :color="step.q1Pass ? 'success' : 'error'" size="small">
                    {{ step.q1Pass ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </td>
                <td>
                  <v-icon :color="step.q2Pass ? 'success' : 'error'" size="small">
                    {{ step.q2Pass ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </td>
                <td>
                  <v-icon :color="step.q3Pass ? 'success' : 'error'" size="small">
                    {{ step.q3Pass ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </td>
                <td>
                  <v-icon :color="step.q4Pass ? 'success' : 'error'" size="small">
                    {{ step.q4Pass ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </td>
                <td>
                  <v-chip
                    :color="step.passed ? 'success' : 'error'"
                    size="x-small"
                  >
                    {{ step.passed ? 'Pass' : 'Fail' }}
                  </v-chip>
                </td>
                <td>
                  <v-chip
                    v-if="step.severity"
                    :color="severityColor(step.severity)"
                    size="x-small"
                  >
                    {{ step.severity }}
                  </v-chip>
                  <span v-else class="text-grey">—</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  taskResults: { type: Array, default: () => [] },
})

const severityColor = (severity) => {
  const colors = { critical: 'red', high: 'deep-orange', medium: 'orange', low: 'amber' }
  return colors[severity] || 'grey'
}

const totalSteps = computed(() => {
  return props.taskResults.reduce((acc, t) => acc + t.steps.length, 0)
})

const totalFailures = computed(() => {
  return props.taskResults.reduce(
    (acc, t) => acc + t.steps.filter((s) => !s.passed).length,
    0,
  )
})

const passRate = computed(() => {
  if (!totalSteps.value) return 0
  const passed = totalSteps.value - totalFailures.value
  return Math.round((passed / totalSteps.value) * 100)
})
</script>
