<template>
  <div class="sankey-wrapper">
    <div v-if="!taskData || taskData.length === 0" class="text-center pa-8 text-medium-emphasis">
      No task flow data available
    </div>
    <div v-else>
      <div v-for="(task, ti) in taskData" :key="ti" class="mb-6">
        <div class="text-subtitle-2 font-weight-medium mb-3">
          <v-icon start size="16" color="brown">mdi-sitemap</v-icon>
          {{ task.title }}
        </div>
        <div class="sankey-flow">
          <div class="sankey-node start-node">
            <div class="node-bar" style="height: 100%; background: #5D4037" />
            <div class="node-label">Start<br><span class="text-caption">{{ task.evaluatorCount }} eval</span></div>
          </div>
          <div v-for="(step, si) in task.steps" :key="si" class="sankey-step">
            <div class="sankey-connection">
              <div class="flow-pass" :style="{ height: step.passPercent + '%' }" />
              <div class="flow-fail" :style="{ height: step.failPercent + '%' }" />
            </div>
            <div class="sankey-node">
              <div class="node-bar-stack">
                <div class="bar-pass" :style="{ height: step.passPercent + '%' }" />
                <div class="bar-fail" :style="{ height: step.failPercent + '%' }" />
              </div>
              <div class="node-label">
                S{{ si + 1 }}
                <div class="text-caption" style="font-size: 10px">
                  <span style="color: #2E7D32">{{ step.passCount }}✓</span>
                  <span v-if="step.failCount > 0" style="color: #C62828" class="ml-1">{{ step.failCount }}✗</span>
                </div>
              </div>
            </div>
          </div>
          <div class="sankey-node end-node">
            <div class="node-bar" :style="{ height: '100%', background: task.completionRate >= 75 ? '#2E7D32' : task.completionRate >= 50 ? '#EF6C00' : '#C62828' }" />
            <div class="node-label">End<br><span class="text-caption font-weight-bold">{{ task.completionRate }}%</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cwAnswers: { type: Object, default: () => ({}) },
  tasks: { type: Array, default: () => [] },
})

const taskData = computed(() => {
  if (!props.tasks.length || !Object.keys(props.cwAnswers).length) return []

  const evaluators = Object.values(props.cwAnswers)
  const evalCount = evaluators.length

  return props.tasks.map((task, tIndex) => {
    const steps = (task.steps || []).map((step, sIndex) => {
      const stepKey = `${tIndex}-${sIndex}`
      let passCount = 0
      let failCount = 0

      evaluators.forEach((ev) => {
        const a = ev?.answers?.[stepKey]
        if (!a) return
        // Step passed if all 4 Q answers are true (or at least not false)
        const passed = a.q1Pass !== false && a.q2Pass !== false && a.q3Pass !== false && a.q4Pass !== false
        if (passed) passCount++
        else failCount++
      })

      const total = passCount + failCount || 1
      return {
        action: step.action,
        passCount, failCount,
        passPercent: Math.round((passCount / total) * 100),
        failPercent: Math.round((failCount / total) * 100),
      }
    })

    let fullPassCount = 0
    evaluators.forEach((ev) => {
      if (!ev?.answers) return
      const allPassed = (task.steps || []).every((_, sIndex) => {
        const a = ev.answers[`${tIndex}-${sIndex}`]
        return a && a.q1Pass !== false && a.q2Pass !== false && a.q3Pass !== false && a.q4Pass !== false
      })
      if (allPassed) fullPassCount++
    })

    return {
      title: task.title,
      evaluatorCount: evalCount,
      steps,
      completionRate: evalCount ? Math.round((fullPassCount / evalCount) * 100) : 0,
    }
  })
})
</script>

<style scoped>
.sankey-flow {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px 0;
}
.sankey-step {
  display: flex;
  align-items: center;
  flex: 1;
}
.sankey-connection {
  display: flex;
  flex-direction: column;
  width: 40px;
  min-width: 40px;
  height: 48px;
}
.flow-pass {
  background: linear-gradient(90deg, #A5D6A7, #66BB6A);
  border-radius: 2px 2px 0 0;
  transition: height 0.3s;
}
.flow-fail {
  background: linear-gradient(90deg, #EF9A9A, #EF5350);
  border-radius: 0 0 2px 2px;
  transition: height 0.3s;
}
.sankey-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
}
.node-bar-stack {
  width: 24px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.bar-pass { background: #66BB6A; transition: height 0.3s; }
.bar-fail { background: #EF5350; transition: height 0.3s; }
.node-bar {
  width: 24px;
  height: 48px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.node-label {
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  margin-top: 4px;
  color: #546E7A;
}
.start-node .node-label, .end-node .node-label { font-weight: 600; }
</style>
