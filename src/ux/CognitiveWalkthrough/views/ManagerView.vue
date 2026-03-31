<template>
  <div>
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="bottomCards"
    >
      <div
        v-if="!test"
        class="d-flex justify-center align-center"
        style="min-height: 400px"
      >
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <v-container v-else class="large-margins">
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center gap-3">
              <h1 class="text-h4">
                {{ test.testTitle || 'Cognitive Walkthrough' }}
              </h1>
              <v-chip class="ml-5" color="brown" variant="outlined" size="small">
                <v-icon start size="small"> mdi-brain </v-icon>
                Cognitive Walkthrough
              </v-chip>
              <v-chip v-if="studyVariant === 'spencer'" class="ml-2" color="orange" variant="tonal" size="small">
                <v-icon start size="12">mdi-lightning-bolt</v-icon>
                Spencer 2Q
              </v-chip>
              <v-chip v-else-if="studyVariant === 'wharton'" class="ml-2" color="brown" variant="tonal" size="small">
                <v-icon start size="12">mdi-clipboard-text</v-icon>
                Wharton 4Q
              </v-chip>
              <v-chip v-else class="ml-2" color="blue-grey" variant="tonal" size="small">
                <v-icon start size="12">mdi-swap-horizontal</v-icon>
                Mixed Mode
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <v-divider class="mb-6" />

        <v-row>
          <v-col cols="12">
            <h2 class="text-h5">
              {{ $t('Dashboard.managerView.generalStatistics') }}
            </h2>
          </v-col>
        </v-row>
        <v-divider class="mb-6" />

        <!-- Study Overview Cards -->
        <v-row>
          <v-col cols="12" md="3">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-2">
                <v-icon color="brown" class="mr-2">mdi-account-group</v-icon>
                <div class="text-subtitle-2 text-grey">Evaluators</div>
              </div>
              <div class="text-h4 font-weight-bold">{{ evaluatorCount }}</div>
              <div class="text-body-2 text-grey mt-1">
                {{ submittedCount }} submitted / {{ inProgressCount }} in progress
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-2">
                <v-icon color="brown" class="mr-2">mdi-format-list-checks</v-icon>
                <div class="text-subtitle-2 text-grey">Tasks / Steps</div>
              </div>
              <div class="text-h4 font-weight-bold">{{ taskCount }}</div>
              <div class="text-body-2 text-grey mt-1">
                {{ stepCount }} steps across {{ taskCount }} tasks
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-2">
                <v-icon color="brown" class="mr-2">mdi-percent</v-icon>
                <div class="text-subtitle-2 text-grey">Avg. Completion</div>
              </div>
              <div class="text-h4 font-weight-bold">{{ averageProgress }}%</div>
              <v-progress-linear
                :model-value="averageProgress"
                :color="averageProgress >= 100 ? 'success' : 'brown'"
                height="6"
                rounded
                class="mt-2"
              />
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-2">
                <v-icon color="brown" class="mr-2">mdi-shield-check</v-icon>
                <div class="text-subtitle-2 text-grey">Learnability</div>
              </div>
              <div class="text-h4 font-weight-bold" :class="learnabilityColor">
                {{ avgLearnability }}%
              </div>
              <div class="text-body-2 text-grey mt-1">
                Average pass rate across evaluators
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h2 class="text-h5">
              {{ $t('Dashboard.managerView.modules') }}
            </h2>
          </v-col>
        </v-row>
        <v-divider class="mb-6" />

        <v-row class="modules-section">
          <!-- Recent Activity -->
          <v-col cols="12" md="4">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-icon color="brown" class="mr-2" size="20">mdi-history</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Recent Activity</div>
              </div>
              <v-list density="compact" class="bg-transparent">
                <v-list-item v-for="(activity, ai) in recentActivities" :key="ai" class="px-0">
                  <template #prepend>
                    <v-icon :color="activity.color" size="small" class="mr-2">{{ activity.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ activity.text }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ activity.time }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- Cooperators -->
          <v-col cols="12" md="4">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-icon color="brown" class="mr-2" size="20">mdi-account-multiple</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Cooperators</div>
              </div>
              <v-list density="compact" class="bg-transparent">
                <v-list-item
                  v-for="(coop, ci) in cooperators"
                  :key="ci"
                  class="px-0"
                >
                  <template #prepend>
                    <v-avatar color="brown" size="28" class="mr-2">
                      <span class="text-caption text-white font-weight-bold">
                        {{ coop.initials }}
                      </span>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2">{{ coop.email }}</v-list-item-title>
                  <template #append>
                    <v-chip :color="coop.levelColor" size="x-small" variant="tonal">
                      {{ coop.levelLabel }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-list-item v-if="!cooperators.length" class="px-0">
                  <v-list-item-title class="text-body-2 text-medium-emphasis text-center">
                    No cooperators added
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- Walkthrough Info -->
          <v-col cols="12" md="4">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-icon color="brown" class="mr-2" size="20">mdi-brain</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Walkthrough Info</div>
              </div>

              <div class="mb-3">
                <div class="text-caption text-grey mb-1">Persona</div>
                <div class="text-body-2 font-weight-medium">
                  {{ test.persona?.name || 'Not configured' }}
                </div>
                <div v-if="test.persona?.experience" class="text-caption text-grey">
                  {{ test.persona.experience }}
                </div>
              </div>

              <v-divider class="mb-3" />

              <div class="mb-3">
                <div class="text-caption text-grey mb-1">Variant</div>
                <v-chip :color="studyVariant === 'spencer' ? 'orange' : studyVariant === 'wharton' ? 'brown' : 'blue-grey'" size="x-small" variant="tonal">
                  {{ studyVariant === 'spencer' ? 'Spencer (2Q)' : studyVariant === 'wharton' ? 'Wharton (4Q)' : 'Both (evaluator picks)' }}
                </v-chip>
              </div>

              <v-divider class="mb-3" />

              <div>
                <div class="text-caption text-grey mb-1">Structure</div>
                <div
                  v-for="(task, tIndex) in tasksReconstructed.slice(0, 3)"
                  :key="tIndex"
                  class="d-flex align-center mb-1"
                >
                  <v-chip color="brown" size="x-small" class="mr-2">T{{ tIndex + 1 }}</v-chip>
                  <span class="text-body-2">{{ task.title }}</span>
                  <v-chip size="x-small" variant="tonal" class="ml-auto">
                    {{ task.steps?.length || 0 }}
                  </v-chip>
                </div>
                <div v-if="tasksReconstructed.length > 3" class="text-caption text-medium-emphasis mt-1">
                  +{{ tasksReconstructed.length - 3 }} more tasks
                </div>
                <div v-if="!tasksReconstructed.length" class="text-caption text-medium-emphasis">
                  No tasks configured
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-2 modules-section">
          <!-- Severity Overview -->
          <v-col cols="12" md="4">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-icon color="brown" class="mr-2" size="20">mdi-alert-circle-outline</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Severity Overview</div>
              </div>
              <div v-for="(sev, si) in severityDistribution" :key="si" class="mb-2">
                <div class="d-flex align-center justify-space-between mb-1">
                  <v-chip :color="sev.color" size="x-small">{{ sev.label }}</v-chip>
                  <span class="text-caption">{{ sev.count }} steps</span>
                </div>
                <v-progress-linear
                  :model-value="sev.percentage"
                  :color="sev.color"
                  height="6"
                  rounded
                />
              </div>
            </v-card>
          </v-col>

          <!-- Question-Level Pass Rates -->
          <v-col cols="12" md="4">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-icon color="brown" class="mr-2" size="20">mdi-chart-bar</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Question Analysis</div>
              </div>
              <div v-for="(q, qi) in activeQuestionStats" :key="qi" class="mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-body-2">{{ q.label }}</span>
                  <span class="text-body-2 font-weight-bold">{{ q.passRate }}%</span>
                </div>
                <v-progress-linear
                  :model-value="q.passRate"
                  :color="q.passRate >= 75 ? 'success' : q.passRate >= 50 ? 'warning' : 'error'"
                  height="6"
                  rounded
                />
              </div>
            </v-card>
          </v-col>

          <!-- Evaluation Progress -->
          <v-col cols="12" md="4">
            <v-card class="pa-4 fill-height" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-icon color="brown" class="mr-2" size="20">mdi-chart-timeline-variant</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Evaluation Progress</div>
              </div>
              <v-list density="compact" class="bg-transparent">
                <v-list-item
                  v-for="(ev, ei) in evaluatorProgress"
                  :key="ei"
                  class="px-0"
                >
                  <template #prepend>
                    <v-avatar color="brown" size="24" class="mr-2">
                      <span class="text-caption text-white font-weight-bold">{{ ei + 1 }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>
                    <div class="d-flex align-center">
                      <span class="text-body-2 mr-2">Ev{{ ei + 1 }}</span>
                      <v-progress-linear
                        :model-value="ev.progress"
                        :color="ev.submitted ? 'success' : 'brown'"
                        height="8"
                        rounded
                        style="max-width: 120px"
                      />
                      <span class="text-caption ml-2">{{ ev.progress }}%</span>
                    </div>
                  </v-list-item-title>
                  <template #append>
                    <v-chip
                      :color="ev.submitted ? 'success' : 'warning'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ ev.submitted ? 'Done' : 'WIP' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </ManagerView>
  </div>
</template>

<script setup>
import {
  getBottomCardsDefualt,
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()

const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value

  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  if (coop) return coop.accessLevel

  return currentTest?.isPublic ? ACCESS_LEVEL.EVALUATOR : ACCESS_LEVEL.GUEST
})

const tasksReconstructed = computed(() => {
  if (test.value?.testStructure && test.value.testStructure.length > 0) {
    return test.value.testStructure
  }
  const tKeys = new Set()
  const sKeys = new Set()
  const cwAnswers = testAnswerDocument.value?.cwAnswers || {}
  Object.values(cwAnswers).forEach((a) => {
    if (!a.answers) return
    Object.keys(a.answers).forEach((k) => {
      const parts = k.split('-')
      if (parts.length === 2) {
        tKeys.add(parts[0])
        sKeys.add(k)
      }
    })
  })
  if (tKeys.size === 0) return []
  return Array.from(tKeys).map((_, i) => ({
    title: `Task ${i + 1}`,
    steps: Array.from(sKeys).filter(k => k.startsWith(`${i}-`)).map(() => ({ action: 'Step' }))
  }))
})

const taskCount = computed(() => tasksReconstructed.value.length)
const stepCount = computed(() => {
  return tasksReconstructed.value.reduce(
    (acc, task) => acc + (task.steps?.length || 0),
    0,
  )
})

const testAnswerDocument = computed(() => store.getters.testAnswerDocument)

const evaluatorEntries = computed(() => {
  const doc = testAnswerDocument.value
  if (!doc?.cwAnswers) return []
  return Object.entries(doc.cwAnswers).map(([id, a]) => ({
    id,
    submitted: a.submitted || false,
    progress: a.progress || 0,
    passRate: a.passRate || 0,
    learnabilityScore: a.learnabilityScore || 0,
    submittedAt: a.submittedAt || null,
  }))
})

const evaluatorCount = computed(() => evaluatorEntries.value.length)
const submittedCount = computed(() => evaluatorEntries.value.filter((e) => e.submitted).length)
const inProgressCount = computed(() => evaluatorEntries.value.filter((e) => !e.submitted).length)
const averageProgress = computed(() => {
  if (!evaluatorEntries.value.length) return 0
  return Math.round(evaluatorEntries.value.reduce((s, e) => s + e.progress, 0) / evaluatorEntries.value.length)
})
const avgLearnability = computed(() => {
  if (!evaluatorEntries.value.length) return 0
  return Math.round(evaluatorEntries.value.reduce((s, e) => s + e.passRate, 0) / evaluatorEntries.value.length)
})
const learnabilityColor = computed(() => {
  if (avgLearnability.value >= 75) return 'text-success'
  if (avgLearnability.value >= 50) return 'text-warning'
  return 'text-error'
})

const cooperators = computed(() => {
  const coops = test.value?.cooperators || []
  return coops.map((c) => ({
    email: c.userEmail || c.userDocId || 'Unknown',
    initials: (c.userEmail || 'U').substring(0, 2).toUpperCase(),
    levelLabel: c.accessLevel === 0 ? 'Admin' : 'Evaluator',
    levelColor: c.accessLevel === 0 ? 'info' : 'grey',
  }))
})

const recentActivities = computed(() => {
  const activities = []
  evaluatorEntries.value.forEach((ev, i) => {
    if (ev.submitted) {
      activities.push({
        text: `Ev${i + 1} submitted evaluation`,
        icon: 'mdi-check-circle',
        color: 'success',
        time: ev.submittedAt ? new Date(ev.submittedAt).toLocaleString() : '',
      })
    } else if (ev.progress > 0) {
      activities.push({
        text: `Ev${i + 1} evaluation in progress (${ev.progress}%)`,
        icon: 'mdi-play-circle',
        color: 'info',
        time: '',
      })
    }
  })
  if (!activities.length) {
    activities.push({ text: 'No activity yet', icon: 'mdi-clock-outline', color: 'grey', time: '' })
  }
  return activities
})

const evaluatorProgress = computed(() => {
  return evaluatorEntries.value.map((e) => ({
    progress: e.progress,
    submitted: e.submitted,
  }))
})

const studyVariant = computed(() => test.value?.cwVariant || 'both')

const getEvaluatorVariant = (evId) => {
  const doc = testAnswerDocument.value
  const answerData = doc?.cwAnswers?.[evId]
  if (answerData?.cwVariant) return answerData.cwVariant
  // Fallback: if Q2/Q3 are always true + Q1 is answered => Spencer
  if (answerData?.answers) {
    const vals = Object.values(answerData.answers)
    const allQ2True = vals.every(a => a?.q2Pass === true)
    const allQ3True = vals.every(a => a?.q3Pass === true)
    const someQ1Answered = vals.some(a => a?.q1Pass !== null && a?.q1Pass !== undefined)
    if (someQ1Answered && allQ2True && allQ3True) return 'spencer'
  }
  return studyVariant.value === 'spencer' ? 'spencer' : 'wharton'
}

const isSpencerOnly = computed(() => {
  return evaluatorEntries.value.every(ev => getEvaluatorVariant(ev.id) === 'spencer')
})

const severityDistribution = computed(() => {
  const counts = { Pass: 0, Low: 0, Medium: 0, High: 0, Critical: 0 }
  
  evaluatorEntries.value.forEach((ev) => {
    const evVariant = getEvaluatorVariant(ev.id)
    const doc = testAnswerDocument.value
    const answerData = doc?.cwAnswers?.[ev.id]
    if (!answerData?.answers) return
    Object.values(answerData.answers).forEach((a) => {
      if (!a) return
      const qs = [a.q1Pass, a.q2Pass, a.q3Pass, a.q4Pass]
      const answered = qs.filter((v) => v !== null && v !== undefined)
      if (answered.length === 0) return
      
      if (evVariant === 'spencer') {
        const spencerFails = [a.q1Pass, a.q4Pass].filter(v => v === false).length
        if (spencerFails === 0) counts.Pass++
        else if (spencerFails === 1) counts.Medium++
        else counts.Critical++
      } else {
        const failCount = qs.filter((v) => v === false).length
        if (failCount === 0) counts.Pass++
        else if (failCount === 1) counts.Low++
        else if (failCount === 2) counts.Medium++
        else if (failCount === 3) counts.High++
        else counts.Critical++
      }
    })
  })
  const total = Object.values(counts).reduce((s, c) => s + c, 0) || 1
  let dist = [
    { label: 'Pass', color: 'success', count: counts.Pass, percentage: Math.round((counts.Pass / total) * 100) },
    { label: 'Low', color: 'amber', count: counts.Low, percentage: Math.round((counts.Low / total) * 100) },
    { label: 'Medium', color: 'orange', count: counts.Medium, percentage: Math.round((counts.Medium / total) * 100) },
    { label: 'High', color: 'deep-orange', count: counts.High, percentage: Math.round((counts.High / total) * 100) },
    { label: 'Critical', color: 'red', count: counts.Critical, percentage: Math.round((counts.Critical / total) * 100) },
  ]
  if (isSpencerOnly.value) dist = dist.filter(d => ['Pass', 'Medium', 'Critical'].includes(d.label))
  return dist
})

const questionStats = computed(() => {
  const qTotals = [0, 0, 0, 0]
  const qPassed = [0, 0, 0, 0]
  const keys = ['q1Pass', 'q2Pass', 'q3Pass', 'q4Pass']

  evaluatorEntries.value.forEach((ev) => {
    const doc = testAnswerDocument.value
    const answerData = doc?.cwAnswers?.[ev.id]
    if (!answerData?.answers) return
    Object.values(answerData.answers).forEach((a) => {
      if (!a) return
      keys.forEach((k, qi) => {
        if (a[k] !== null && a[k] !== undefined) {
          qTotals[qi]++
          if (a[k]) qPassed[qi]++
        }
      })
    })
  })

  return [0, 1, 2, 3].map(qi => ({
    passRate: qTotals[qi] ? Math.round((qPassed[qi] / qTotals[qi]) * 100) : 0,
  }))
})

const activeQuestionStats = computed(() => {
  if (isSpencerOnly.value) {
    return [
      { label: 'Q1: Goal', passRate: questionStats.value[0].passRate },
      { label: 'Q2: Feedback', passRate: questionStats.value[3].passRate },
    ]
  }
  const labels = ['Q1: Goal', 'Q2: Visibility', 'Q3: Affordance', 'Q4: Feedback']
  return labels.map((label, qi) => ({
    label,
    passRate: questionStats.value[qi].passRate,
  }))
})

const topCards = computed(() => {
  if (!test.value) return []
  return getTopCardsDefualt(test.value, 'cognitive-walkthrough')
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return getBottomCardsDefualt(test.value, 'cognitive-walkthrough')
})

const navigator = computed(() => {
  if (!test.value) return []
  return [
    ...getNavigatorDefault(
      test.value,
      accessLevel.value,
      route,
      'cognitive-walkthrough',
    ),
  ]
})

onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>

<style scoped>
.large-margins {
  margin-left: auto !important;
  margin-right: auto !important;
  width: 70% !important;
  max-width: none !important;
}

@media (max-width: 1200px) {
  .large-margins {
    width: 80% !important;
  }
}

@media (max-width: 960px) {
  .large-margins {
    width: 90% !important;
  }

  .d-flex.gap-3 {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px !important;
  }
}

@media (max-width: 600px) {
  .large-margins {
    width: 96% !important;
  }
}

.modules-section :deep(.v-card) {
  height: 300px;
}
</style>
