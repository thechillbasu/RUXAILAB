<template>
  <PageWrapper
    :title="answers.length > 0 ? $t('Final Report') : ''"
    :loading="loading"
    :loading-text="$t('HeuristicsReport.messages.reports_loading')"
    :side-gap="true"
  >
    <!-- Subtitle Slot - only show when answers exist -->
    <template v-if="answers.length > 0" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Prepare the final report for the heuristic evaluation
      </p>
    </template>

    <!-- Show IntroFinalReport when no answers -->
    <IntroFinalReport v-if="answers.length === 0" @go-to-coops="goToCoops" />

    <!-- Show main content when answers exist -->
    <div v-else class="finalReportView">
      <v-container>
        <!-- Report Summary Section -->
        <v-card flat rounded="xl" class="mb-4" style="background: #f8f9fc">
          <v-card-title class="d-flex align-center pa-5">
            <v-avatar color="#E3F2FD" size="36" class="mr-3">
              <v-icon color="#1565C0" size="18">mdi-file-chart-outline</v-icon>
            </v-avatar>
            <span class="text-subtitle-1 font-weight-medium">Report Summary</span>
          </v-card-title>
          <v-divider />

          <!-- Summary Stats Row -->
          <v-row class="pa-5 ma-0" dense>
            <v-col cols="12" md="3">
              <v-card flat rounded="xl" class="pa-5 text-center" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                <v-progress-circular
                  :model-value="parsePercent(result.average)"
                  :size="110"
                  :width="10"
                  :color="parsePercent(result.average) >= 75 ? '#2E7D32' : parsePercent(result.average) >= 50 ? '#EF6C00' : '#C62828'"
                >
                  <span class="text-body-1 font-weight-bold">{{ result.average }}</span>
                </v-progress-circular>
                <div class="text-caption text-medium-emphasis mt-2">Overall Usability</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card flat rounded="xl" class="pa-5 text-center fill-height d-flex flex-column justify-center" style="background: #EDE7F6; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                <div class="text-h4 font-weight-bold" style="color: #5E35B1">{{ evaluatorCount }}</div>
                <div class="text-caption text-medium-emphasis mt-1">Evaluators</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card flat rounded="xl" class="pa-5 text-center fill-height d-flex flex-column justify-center" style="background: #FFF3E0; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                <div class="text-h4 font-weight-bold" style="color: #E65100">{{ heuristicIssues.length }}</div>
                <div class="text-caption text-medium-emphasis mt-1">Issues Found</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card flat rounded="xl" class="pa-4" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                <div class="text-caption text-medium-emphasis mb-2">Severity Breakdown</div>
                <div v-for="sev in ['critical', 'high', 'medium', 'low']" :key="sev" class="d-flex align-center justify-space-between mb-1">
                  <SeverityBadge :severity="sev" size="x-small" />
                  <span class="text-body-2 font-weight-bold ml-2">{{ sevDist[sev] || 0 }}</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Top Findings -->
          <div v-if="topFindings.length > 0" class="px-5 pb-4">
            <div class="text-caption text-medium-emphasis mb-2" style="letter-spacing: 0.08em; font-weight: 600">TOP FINDINGS</div>
            <v-card
              v-for="(issue, idx) in topFindings"
              :key="idx"
              flat
              rounded="lg"
              class="mb-2 pa-3 finding-card"
              :style="{ borderLeft: `3px solid ${sevColor[issue.severity]}` }"
            >
              <v-row align="center" dense>
                <v-col cols="auto">
                  <SeverityBadge :severity="issue.severity" size="x-small" />
                </v-col>
                <v-col>
                  <span class="text-body-2">{{ issue.category }} — {{ issue.description }}</span>
                </v-col>
              </v-row>
            </v-card>
          </div>

          <!-- Link to Answers -->
          <div class="px-5 pb-5">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              rounded="lg"
              @click="goToAnswers"
            >
              <v-icon start size="16">mdi-open-in-new</v-icon>
              View full details in Answers tab
            </v-btn>
          </div>
        </v-card>

        <!-- Conclusion Stepper -->
        <v-stepper
          :model-value="step"
          style="background-color: #f5f7ff"
          class="final-report-box rounded pt-0 mb-4"
          elevation="0"
        >
          <v-stepper-header style="background-color: #f5f7ff" class="pt-2">
            <v-stepper-item :complete="step > 1" :value="1" color="orange">
              Report Conclusion
            </v-stepper-item>
            <v-divider />
            <v-stepper-item :complete="step > 2" :value="2" color="orange">
              Generate Report
            </v-stepper-item>
          </v-stepper-header>

          <v-stepper-window style="background-color: #f5f7ff" class="mt-0">
            <v-stepper-window-item :value="1" class="align-mid pt-5 min-h-500">
              <div v-if="loading">Saving Conclusion on Test....</div>
              <div v-else class="container">
                <div class="row">
                  <TextControls />
                </div>

                <div class="row">
                  <div class="col">
                    <div id="myTextarea" contenteditable class="form-control" />
                  </div>
                </div>
                <v-row class="ma-0" justify="end">
                  <v-btn
                    class="mt-4"
                    align="right"
                    color="orange"
                    elevation="0"
                    @click="handleNext"
                  >
                    {{ $t('buttons.next') }}
                  </v-btn>
                </v-row>
              </div>
            </v-stepper-window-item>

            <v-stepper-window-item :value="2" class="align-mid pt-5 min-h-500">
              <FinalReportSelectionBox @return-step="step--" />
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-container>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import TextControls from '@/ux/Heuristic/components/final_report/FinalReportControls.vue'
import FinalReportSelectionBox from '@/ux/Heuristic/components/final_report/FinalReportSelectionBox.vue'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import IntroFinalReport from '@/ux/Heuristic/components/IntroFinalReport.vue'
import SeverityBadge from '@/shared/components/SeverityBadge.vue'
import { toIssues, getSeverityDistribution } from '@/ux/Heuristic/utils/heuristicResultsAdapter'

const store = useStore()
const router = useRouter()

const step = ref(1)
const object = ref({})
let intro = ref(null)

const loading = ref(false)

const test = computed(() => store.getters.test)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)

const answers = computed(() => {
  if (testAnswerDocument.value && testAnswerDocument.value.heuristicAnswers) {
    return Object.values(testAnswerDocument.value.heuristicAnswers)
  }
  return []
})

const result = computed(() => {
  // Compute usability directly from answer data — no store dependency needed
  if (!testAnswerDocument.value?.heuristicAnswers || !test.value?.testOptions) {
    return { average: '0%', max: '0%', min: '0%', sd: '0%' }
  }
  const maxOption = test.value.testOptions.reduce((mx, op) => Math.max(mx, op.value || 0), 0)
  if (maxOption === 0) return { average: '0%', max: '0%', min: '0%', sd: '0%' }

  const evaluatorScores = []
  Object.values(testAnswerDocument.value.heuristicAnswers).forEach((answer) => {
    if (!answer?.heuristicQuestions) return
    let totalScore = 0
    let totalQuestions = 0
    answer.heuristicQuestions.forEach((hq) => {
      if (!hq?.heuristicQuestions) return
      Object.values(hq.heuristicQuestions).forEach((q) => {
        const val = q?.heuristicAnswer?.value
        if (val != null && !isNaN(val)) {
          totalScore += val
          totalQuestions++
        }
      })
    })
    if (totalQuestions > 0) {
      evaluatorScores.push((totalScore / (totalQuestions * maxOption)) * 100)
    }
  })

  if (evaluatorScores.length === 0) return { average: '0%', max: '0%', min: '0%', sd: '0%' }

  const avg = evaluatorScores.reduce((a, b) => a + b, 0) / evaluatorScores.length
  const max = Math.max(...evaluatorScores)
  const min = Math.min(...evaluatorScores)
  const variance = evaluatorScores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / evaluatorScores.length
  const sd = Math.sqrt(variance)

  return {
    average: `${avg.toFixed(2)}%`,
    max: `${max.toFixed(2)}%`,
    min: `${min.toFixed(2)}%`,
    sd: `${sd.toFixed(2)}%`,
  }
})

const heuristicIssues = computed(() => {
  return toIssues(testAnswerDocument.value, test.value)
})

const sevDist = computed(() => {
  return getSeverityDistribution(heuristicIssues.value)
})

const evaluatorCount = computed(() => {
  if (!testAnswerDocument.value?.heuristicAnswers) return 0
  return Object.keys(testAnswerDocument.value.heuristicAnswers).length
})

const topFindings = computed(() => {
  const weight = { critical: 4, high: 3, medium: 2, low: 1 }
  return [...heuristicIssues.value]
    .sort((a, b) => (weight[b.severity] || 0) - (weight[a.severity] || 0))
    .slice(0, 5)
})

const sevColor = {
  critical: '#D32F2F',
  high: '#E64A19',
  medium: '#F57F17',
  low: '#388E3C',
}

const parsePercent = (val) => {
  if (!val) return 0
  return parseFloat(String(val).replace('%', '')) || 0
}

const setInnerHtml = () => {
  const textarea = document.getElementById('myTextarea')
  if (textarea) {
    textarea.innerHTML = test.value.studyConclusion || ''
  }
}

const update = async () => {
  const contenteditable = document.getElementById('myTextarea')
  const text = contenteditable.innerHTML

  object.value.studyConclusion = text
  const rawData = { ...test.value, ...object.value }
  const updatedTest = instantiateStudyByType(rawData.testType, rawData)
  await store.dispatch('updateStudy', updatedTest)
  await store.dispatch('getStudy', { id: test.value.id })
}

const handleNext = async () => {
  loading.value = true
  await update()
  loading.value = false
  step.value++
}

const goToCoops = () => {
  if (test.value?.id) {
    router.push(`/heuristic/cooperators/${test.value.id}`)
  }
}

const goToAnswers = () => {
  if (test.value?.id) {
    router.push(`/heuristic/answer/${test.value.id}`)
  }
}

onMounted(() => {
  setInnerHtml()
})
</script>

<style scoped>
.form-control {
  background-color: white;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12) !important;
  width: 100%;
  height: 55vh;
  resize: none;
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  font-size: small;
}
.finding-card {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}
.finding-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
</style>
