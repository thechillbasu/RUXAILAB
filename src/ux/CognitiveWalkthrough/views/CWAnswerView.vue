<template>
  <PageWrapper :title="hasAnswers ? 'Answers' : ''" :side-gap="true">
    <template v-if="hasAnswers" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Review evaluator responses and aggregated CW results
      </p>
    </template>

    <div v-if="hasAnswers">
      <v-row justify="center" class="ma-0 mt-4">
        <ShowInfo :hide-col="true">
          <template #top>
            <v-tabs v-model="tab" bg-color="transparent" color="#795548" class="ml-4">
              <v-tab @click="tab = 0">Statistics</v-tab>
              <v-tab @click="tab = 1">Evaluators</v-tab>
              <v-tab @click="tab = 2">Tasks</v-tab>
              <v-tab @click="tab = 3">
                <v-icon start size="16">mdi-alert-decagram-outline</v-icon>
                Issues
              </v-tab>
            </v-tabs>
          </template>

          <template #content>
            <div class="ma-0 pa-0">
              <!-- Tab 1: Statistics Summary -->
              <div v-if="tab === 0" class="pa-6">
                <!-- Variant Indicator -->
                <div class="d-flex align-center ga-2 mb-4">
                  <v-chip v-if="studyVariant === 'spencer'" color="orange" variant="tonal" size="small">
                    <v-icon start size="14">mdi-lightning-bolt</v-icon>
                    Spencer 2Q Mode
                  </v-chip>
                  <v-chip v-else-if="studyVariant === 'wharton'" color="brown" variant="tonal" size="small">
                    <v-icon start size="14">mdi-clipboard-text</v-icon>
                    Wharton 4Q Mode
                  </v-chip>
                  <v-chip v-else color="blue-grey" variant="tonal" size="small">
                    <v-icon start size="14">mdi-swap-horizontal</v-icon>
                    Mixed Mode ({{ spencerCount }} Spencer, {{ whartonCount }} Wharton)
                  </v-chip>
                </div>

                <v-row>
                  <v-col cols="12" md="3">
                    <v-card flat rounded="xl" class="pa-5 text-center" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                      <v-progress-circular :model-value="overallLearnability" :size="130" :width="12" :color="overallLearnability >= 75 ? '#2E7D32' : overallLearnability >= 50 ? '#EF6C00' : '#C62828'">
                        <div>
                          <div class="text-h5 font-weight-bold">{{ overallLearnability }}%</div>
                        </div>
                      </v-progress-circular>
                      <div class="text-caption text-medium-emphasis mt-3">Overall Learnability</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card flat rounded="xl" class="pa-5 text-center fill-height d-flex flex-column justify-center" style="background: #E8F5E9; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                      <div class="text-h4 font-weight-bold" style="color: #2E7D32">{{ overallPassRate }}%</div>
                      <div class="text-caption text-medium-emphasis mt-1">Pass Rate</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card flat rounded="xl" class="pa-5 text-center fill-height d-flex flex-column justify-center" style="background: #EDE7F6; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                      <div class="text-h4 font-weight-bold" style="color: #5E35B1">{{ evaluatorRows.length }}</div>
                      <div class="text-caption text-medium-emphasis mt-1">Evaluators</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card flat rounded="xl" class="pa-5 text-center fill-height d-flex flex-column justify-center" style="background: #E3F2FD; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                      <div class="text-h4 font-weight-bold" style="color: #1565C0">{{ totalSteps }}</div>
                      <div class="text-caption text-medium-emphasis mt-1">Steps Evaluated</div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Question-Level Breakdown -->
                <v-card flat rounded="xl" class="pa-5 mt-4" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                  <div class="text-subtitle-1 font-weight-medium mb-3" style="color: #546E7A; letter-spacing: 0.02em">Question-Level Breakdown</div>
                  <v-row>
                    <v-col v-for="(q, qi) in activeQuestionLabels" :key="qi" cols="12" :md="activeQuestionLabels.length === 2 ? 6 : 3">
                      <div class="text-center pa-3">
                        <v-progress-circular :model-value="questionPassRates[qi]" :size="72" :width="7" :color="questionPassRates[qi] >= 75 ? '#2E7D32' : questionPassRates[qi] >= 50 ? '#EF6C00' : '#C62828'">
                          <span class="text-body-2 font-weight-bold">{{ questionPassRates[qi] }}%</span>
                        </v-progress-circular>
                        <div class="text-caption text-medium-emphasis mt-2">{{ q.label }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>

                <!-- Severity Distribution -->
                <v-card flat rounded="xl" class="pa-5 mt-4" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                  <div class="text-subtitle-1 font-weight-medium mb-3" style="color: #546E7A; letter-spacing: 0.02em">Severity Distribution</div>
                  <div v-for="sev in severityDistribution" :key="sev.label" class="mb-3">
                    <div class="d-flex align-center justify-space-between mb-1">
                      <v-chip :color="sev.color" size="x-small" variant="tonal" class="text-capitalize">{{ sev.label }}</v-chip>
                      <span class="text-caption text-medium-emphasis">{{ sev.count }} steps ({{ sev.percentage }}%)</span>
                    </div>
                    <v-progress-linear :model-value="sev.percentage" :color="sev.color" height="8" rounded bg-color="#ECEFF1" />
                  </div>
                </v-card>

                <!-- Method Breakdown (only in mixed mode) -->
                <v-card v-if="isMixedMode" flat rounded="xl" class="pa-5 mt-4" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                  <div class="text-subtitle-1 font-weight-medium mb-3" style="color: #546E7A; letter-spacing: 0.02em">Method Breakdown</div>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card flat rounded="lg" class="pa-4" style="background: #FFF3E0; border: 1px solid #FFCC80">
                        <div class="d-flex align-center mb-2">
                          <v-icon color="brown" size="18" class="mr-2">mdi-clipboard-text</v-icon>
                          <span class="text-subtitle-2 font-weight-bold">Wharton (4Q)</span>
                          <v-chip size="x-small" variant="tonal" class="ml-2">{{ whartonCount }} evaluator{{ whartonCount !== 1 ? 's' : '' }}</v-chip>
                        </div>
                        <div class="text-h5 font-weight-bold" style="color: #E65100">{{ methodScores.wharton.passRate }}%</div>
                        <div class="text-caption text-medium-emphasis">Pass Rate</div>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-card flat rounded="lg" class="pa-4" style="background: #FFF8E1; border: 1px solid #FFE082">
                        <div class="d-flex align-center mb-2">
                          <v-icon color="orange" size="18" class="mr-2">mdi-lightning-bolt</v-icon>
                          <span class="text-subtitle-2 font-weight-bold">Spencer (2Q)</span>
                          <v-chip size="x-small" variant="tonal" class="ml-2">{{ spencerCount }} evaluator{{ spencerCount !== 1 ? 's' : '' }}</v-chip>
                        </div>
                        <div class="text-h5 font-weight-bold" style="color: #F57F17">{{ methodScores.spencer.passRate }}%</div>
                        <div class="text-caption text-medium-emphasis">Pass Rate</div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>

                <!-- Inter-Rater Reliability -->
                <v-card flat rounded="xl" class="pa-5 mt-4" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-subtitle-1 font-weight-medium" style="color: #546E7A; letter-spacing: 0.02em">Inter-Rater Reliability</div>
                      <div class="text-caption text-medium-emphasis mt-1">{{ cwAlphaResult.interpretation }}</div>
                    </div>
                    <v-chip :color="cwAlphaColor" size="small" variant="tonal">
                      <v-icon start size="14">mdi-shield-check</v-icon>
                      α = {{ cwAlphaResult.alpha != null ? cwAlphaResult.alpha : 'N/A' }}
                    </v-chip>
                  </div>
                </v-card>

                <!-- Task Flow Sankey -->
                <v-card flat rounded="xl" class="pa-5 mt-4" style="background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06)">
                  <div class="text-subtitle-1 font-weight-medium mb-3" style="color: #546E7A; letter-spacing: 0.02em">Task Flow Analysis</div>
                  <SankeyDiagram :cw-answers="cwAnswers" :tasks="tasks" />
                </v-card>
              </div>

              <!-- Tab 2: Evaluators -->
              <div v-if="tab === 1" class="pa-6">
                <v-card elevation="1">
                  <v-data-table :headers="evaluatorHeaders" :items="evaluatorRows" item-value="evaluator" class="elevation-0" @click:row="(_, { item }) => toggleExpanded(item.id)">
                    <template #[`item.evaluator`]="{ item }">
                      <div class="d-flex align-center">
                        <v-avatar color="brown" size="28" class="mr-2">
                          <span class="text-caption text-white font-weight-bold">{{ item.evaluator.replace('Ev', '') }}</span>
                        </v-avatar>
                        {{ item.evaluator }}
                      </div>
                    </template>
                    <template #[`item.variant`]="{ item }">
                      <v-chip :color="item.variant === 'spencer' ? 'orange' : 'brown'" size="x-small" variant="tonal">
                        <v-icon start size="12">{{ item.variant === 'spencer' ? 'mdi-lightning-bolt' : 'mdi-clipboard-text' }}</v-icon>
                        {{ item.variant === 'spencer' ? '2Q' : '4Q' }}
                      </v-chip>
                    </template>
                    <template #[`item.status`]="{ item }">
                      <v-chip :color="item.submitted ? 'success' : 'warning'" size="small">
                        {{ item.submitted ? 'Submitted' : 'In Progress' }}
                      </v-chip>
                    </template>
                    <template #[`item.progress`]="{ item }">
                      <v-progress-linear :model-value="item.progress" :color="item.progress >= 100 ? 'success' : 'brown'" height="20" rounded>
                        <template #default><span class="text-caption font-weight-bold">{{ item.progress }}%</span></template>
                      </v-progress-linear>
                    </template>
                    <template #[`item.passRate`]="{ item }">
                      <v-chip :color="item.passRate >= 75 ? 'success' : item.passRate >= 50 ? 'warning' : 'error'" size="small" variant="tonal">
                        {{ item.passRate }}%
                      </v-chip>
                    </template>
                    <template #[`item.actions`]="{ item }">
                      <v-btn icon variant="text" size="small" color="brown" @click="toggleExpanded(item.id)">
                        <v-icon>{{ expandedId === item.id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-card>

                <v-expand-transition>
                  <v-card v-if="expandedId && expandedDetail" class="mt-4 pa-5" elevation="1">
                    <div class="d-flex align-center justify-space-between mb-4">
                      <div class="d-flex align-center ga-2">
                        <div class="text-h6">{{ expandedDetail.evaluator }} — Detailed Answers</div>
                        <v-chip :color="expandedDetail.variant === 'spencer' ? 'orange' : 'brown'" size="x-small" variant="tonal">
                          {{ expandedDetail.variant === 'spencer' ? 'Spencer 2Q' : 'Wharton 4Q' }}
                        </v-chip>
                      </div>
                      <v-btn icon variant="text" size="small" @click="expandedId = null">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </div>
                    <v-expansion-panels variant="accordion" flat>
                      <v-expansion-panel v-for="(task, tIndex) in expandedDetail.tasks" :key="tIndex">
                        <v-expansion-panel-title>
                          <div class="d-flex align-center">
                            <v-chip color="brown" size="x-small" class="mr-2">T{{ tIndex + 1 }}</v-chip>
                            <span class="font-weight-medium">{{ task.title }}</span>
                            <v-chip :color="task.passRate >= 75 ? 'success' : task.passRate >= 50 ? 'warning' : 'error'" size="x-small" variant="tonal" class="ml-2">
                              {{ task.passRate }}%
                            </v-chip>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-table density="compact">
                            <thead>
                              <tr>
                                <th>Step</th>
                                <th class="text-center">Q1</th>
                                <th v-if="expandedDetail.variant !== 'spencer'" class="text-center">Q2</th>
                                <th v-if="expandedDetail.variant !== 'spencer'" class="text-center">Q3</th>
                                <th class="text-center">Q{{ expandedDetail.variant === 'spencer' ? '2' : '4' }}</th>
                                <th class="text-center">Result</th>
                                <th>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(step, sIndex) in task.steps" :key="sIndex">
                                <td class="text-body-2">{{ step.action }}</td>
                                <td class="text-center">
                                  <v-icon :color="step.q1Pass ? 'success' : step.q1Pass === false ? 'error' : 'grey'" size="small">
                                    {{ step.q1Pass ? 'mdi-check' : step.q1Pass === false ? 'mdi-close' : 'mdi-minus' }}
                                  </v-icon>
                                </td>
                                <td v-if="expandedDetail.variant !== 'spencer'" class="text-center">
                                  <v-icon :color="step.q2Pass ? 'success' : step.q2Pass === false ? 'error' : 'grey'" size="small">
                                    {{ step.q2Pass ? 'mdi-check' : step.q2Pass === false ? 'mdi-close' : 'mdi-minus' }}
                                  </v-icon>
                                </td>
                                <td v-if="expandedDetail.variant !== 'spencer'" class="text-center">
                                  <v-icon :color="step.q3Pass ? 'success' : step.q3Pass === false ? 'error' : 'grey'" size="small">
                                    {{ step.q3Pass ? 'mdi-check' : step.q3Pass === false ? 'mdi-close' : 'mdi-minus' }}
                                  </v-icon>
                                </td>
                                <td class="text-center">
                                  <v-icon :color="step.q4Pass ? 'success' : step.q4Pass === false ? 'error' : 'grey'" size="small">
                                    {{ step.q4Pass ? 'mdi-check' : step.q4Pass === false ? 'mdi-close' : 'mdi-minus' }}
                                  </v-icon>
                                </td>
                                <td class="text-center">
                                  <v-chip v-if="step.severity" :color="severityColor(step.severity)" size="x-small">{{ step.severity }}</v-chip>
                                  <v-chip v-else-if="step.passed" color="success" size="x-small">Pass</v-chip>
                                  <span v-else class="text-caption text-grey">—</span>
                                </td>
                                <td class="text-body-2" style="max-width: 180px">{{ step.notes || '—' }}</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card>
                </v-expand-transition>
              </div>

              <!-- Tab 3: Tasks overview -->
              <div v-if="tab === 2" class="pa-6">
                <v-card v-for="(task, tIndex) in taskSummaries" :key="tIndex" class="pa-5 mb-4" elevation="1">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center">
                      <v-chip color="brown" size="small" class="mr-3">T{{ tIndex + 1 }}</v-chip>
                      <div class="text-h6">{{ task.title }}</div>
                    </div>
                    <v-chip :color="task.passRate >= 75 ? 'success' : task.passRate >= 50 ? 'warning' : 'error'" size="small" variant="tonal">
                      {{ task.passRate }}% pass
                    </v-chip>
                  </div>
                  <div class="text-body-2 text-medium-emphasis mb-3">{{ task.description }}</div>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Step</th>
                        <th class="text-center">Avg Q1</th>
                        <th v-if="!isSpencerOnly" class="text-center">Avg Q2</th>
                        <th v-if="!isSpencerOnly" class="text-center">Avg Q3</th>
                        <th class="text-center">Avg Q{{ isSpencerOnly ? '2' : '4' }}</th>
                        <th class="text-center">Pass %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(step, sIndex) in task.steps" :key="sIndex">
                        <td class="text-body-2">{{ step.action }}</td>
                        <td class="text-center">
                          <v-chip :color="step.questionRates[0] >= 75 ? 'success' : step.questionRates[0] >= 50 ? 'warning' : 'error'" size="x-small" variant="tonal">
                            {{ step.questionRates[0] }}%
                          </v-chip>
                        </td>
                        <td v-if="!isSpencerOnly" class="text-center">
                          <v-chip :color="step.questionRates[1] >= 75 ? 'success' : step.questionRates[1] >= 50 ? 'warning' : 'error'" size="x-small" variant="tonal">
                            {{ step.questionRates[1] }}%
                          </v-chip>
                        </td>
                        <td v-if="!isSpencerOnly" class="text-center">
                          <v-chip :color="step.questionRates[2] >= 75 ? 'success' : step.questionRates[2] >= 50 ? 'warning' : 'error'" size="x-small" variant="tonal">
                            {{ step.questionRates[2] }}%
                          </v-chip>
                        </td>
                        <td class="text-center">
                          <v-chip :color="step.questionRates[3] >= 75 ? 'success' : step.questionRates[3] >= 50 ? 'warning' : 'error'" size="x-small" variant="tonal">
                            {{ step.questionRates[3] }}%
                          </v-chip>
                        </td>
                        <td class="text-center">
                          <v-chip :color="step.passRate >= 75 ? 'success' : step.passRate >= 50 ? 'warning' : 'error'" size="x-small">
                            {{ step.passRate }}%
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </div>

              <!-- Tab 4: Issues (shared IssueTable) -->
              <div v-if="tab === 3" class="pa-6">
                <IssueTable :issues="cwIssues" />
              </div>
            </div>
          </template>
        </ShowInfo>
      </v-row>
    </div>

    <div v-else class="text-center pa-12">
      <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
      <div class="text-h5 mb-2">No answers yet</div>
      <div class="text-body-1 text-medium-emphasis">
        Evaluators have not submitted any responses for this walkthrough.
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import IssueTable from '@/shared/components/IssueTable.vue'
import SankeyDiagram from '@/shared/components/charts/SankeyDiagram.vue'
import { toIssues as cwToIssues } from '@/ux/CognitiveWalkthrough/utils/cwResultsAdapter'
import { calculateKrippendorffAlpha, buildCWDataMatrix } from '@/shared/utils/krippendorffAlpha'

const store = useStore()
const tab = ref(0)
const expandedId = ref(null)

const test = computed(() => store.getters.test)
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)

const cwAnswers = computed(() => {
  if (!testAnswerDocument.value?.cwAnswers) return {}
  return testAnswerDocument.value.cwAnswers
})

const hasAnswers = computed(() => Object.keys(cwAnswers.value).length > 0)

// === VARIANT DETECTION ===
const studyVariant = computed(() => test.value?.cwVariant || 'both')

// Per-evaluator variant detection
const getEvaluatorVariant = (evKey) => {
  const answer = cwAnswers.value[evKey]
  if (answer?.cwVariant) return answer.cwVariant
  // Fallback: check if Q2/Q3 are always auto-true (Spencer signature)
  if (answer?.answers) {
    const vals = Object.values(answer.answers)
    const allQ2True = vals.every(a => a?.q2Pass === true)
    const allQ3True = vals.every(a => a?.q3Pass === true)
    const someQ1Answered = vals.some(a => a?.q1Pass !== null && a?.q1Pass !== undefined)
    if (someQ1Answered && allQ2True && allQ3True) return 'spencer'
  }
  return studyVariant.value === 'spencer' ? 'spencer' : 'wharton'
}

const spencerCount = computed(() => evaluatorKeys.value.filter(k => getEvaluatorVariant(k) === 'spencer').length)
const whartonCount = computed(() => evaluatorKeys.value.filter(k => getEvaluatorVariant(k) !== 'spencer').length)
const isMixedMode = computed(() => spencerCount.value > 0 && whartonCount.value > 0)
const isSpencerOnly = computed(() => spencerCount.value > 0 && whartonCount.value === 0)

// Active question labels based on variant
const activeQuestionLabels = computed(() => {
  if (isSpencerOnly.value) {
    return [
      { label: 'Q1: Goal', key: 'q1Pass', index: 0 },
      { label: 'Q2: Feedback', key: 'q4Pass', index: 3 },
    ]
  }
  return [
    { label: 'Q1: Goal', key: 'q1Pass', index: 0 },
    { label: 'Q2: Visibility', key: 'q2Pass', index: 1 },
    { label: 'Q3: Affordance', key: 'q3Pass', index: 2 },
    { label: 'Q4: Feedback', key: 'q4Pass', index: 3 },
  ]
})

const cwIssues = computed(() => {
  return cwToIssues(testAnswerDocument.value, test.value)
})

// Inter-Rater Reliability for CW
const cwAlphaResult = computed(() => {
  if (!testAnswerDocument.value) return { alpha: null, interpretation: 'Insufficient data', pairedCount: 0 }
  const matrix = buildCWDataMatrix(testAnswerDocument.value)
  if (matrix.length < 2) return { alpha: null, interpretation: 'Need ≥2 evaluators', pairedCount: 0 }
  return calculateKrippendorffAlpha(matrix, 'nominal')
})

const cwAlphaColor = computed(() => {
  const a = cwAlphaResult.value.alpha
  if (a == null) return '#9E9E9E'
  if (a >= 0.80) return '#2E7D32'
  if (a >= 0.67) return '#EF6C00'
  return '#C62828'
})

const tasks = computed(() => {
  if (test.value?.testStructure?.length) return test.value.testStructure
  const firstEv = Object.values(cwAnswers.value)[0]
  if (firstEv?.answers) {
    const taskMap = {}
    Object.keys(firstEv.answers).forEach((key) => {
      const [tIdx, sIdx] = key.split('-').map(Number)
      if (!taskMap[tIdx]) taskMap[tIdx] = { title: `Task ${tIdx + 1}`, description: '', steps: [] }
      while (taskMap[tIdx].steps.length <= sIdx) {
        taskMap[tIdx].steps.push({ action: `Step ${taskMap[tIdx].steps.length + 1}` })
      }
    })
    const reconstructed = Object.keys(taskMap).sort((a, b) => a - b).map((k) => taskMap[k])
    if (reconstructed.length) return reconstructed
  }
  return [
    { title: 'Purchase a Product', description: 'Evaluate purchasing flow', steps: [{ action: 'Search' }, { action: 'Select' }, { action: 'Add to cart' }, { action: 'Checkout' }] },
    { title: 'Create an Account', description: 'Evaluate signup flow', steps: [{ action: 'Find signup' }, { action: 'Fill form' }, { action: 'Submit' }] },
    { title: 'Find Customer Support', description: 'Evaluate help flow', steps: [{ action: 'Find help link' }, { action: 'Navigate to contact' }] },
  ]
})

const totalSteps = computed(() => tasks.value.reduce((a, t) => a + (t.steps?.length || 0), 0))

const evaluatorKeys = computed(() => Object.keys(cwAnswers.value))

const evaluatorRows = computed(() => {
  if (!evaluatorKeys.value.length) return []
  return evaluatorKeys.value.map((key, i) => {
    const answer = cwAnswers.value[key]
    return {
      id: key,
      evaluator: `Ev${i + 1}`,
      variant: getEvaluatorVariant(key),
      submitted: answer.submitted || false,
      progress: answer.progress || 0,
      passRate: answer.passRate || 0,
      lastUpdate: answer.lastSaveTime ? new Date(answer.lastSaveTime).toLocaleString() : '-',
    }
  })
})

const evaluatorHeaders = [
  { title: 'Evaluator', value: 'evaluator', align: 'start' },
  { title: 'Variant', value: 'variant', align: 'center', width: '90px' },
  { title: 'Status', value: 'status', align: 'center' },
  { title: 'Progress', value: 'progress', align: 'center', width: '180px' },
  { title: 'Pass Rate', value: 'passRate', align: 'center' },
  { title: 'Last Update', value: 'lastUpdate', align: 'center' },
  { title: '', value: 'actions', align: 'center', width: '50px', sortable: false },
]

const overallLearnability = computed(() => {
  const rates = evaluatorRows.value.map((r) => r.passRate)
  return rates.length ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0
})

const overallPassRate = computed(() => {
  const rates = evaluatorRows.value.filter((r) => r.submitted).map((r) => r.passRate)
  return rates.length ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0
})

// Method-specific scores for mixed mode
const methodScores = computed(() => {
  const wRates = evaluatorRows.value.filter(r => r.variant !== 'spencer' && r.submitted).map(r => r.passRate)
  const sRates = evaluatorRows.value.filter(r => r.variant === 'spencer' && r.submitted).map(r => r.passRate)
  return {
    wharton: { passRate: wRates.length ? Math.round(wRates.reduce((s, r) => s + r, 0) / wRates.length) : 0 },
    spencer: { passRate: sRates.length ? Math.round(sRates.reduce((s, r) => s + r, 0) / sRates.length) : 0 },
  }
})

const questionPassRates = computed(() => {
  const indices = activeQuestionLabels.value.map(q => q.index)
  const keys = ['q1Pass', 'q2Pass', 'q3Pass', 'q4Pass']
  const qTotals = indices.map(() => 0)
  const qPassed = indices.map(() => 0)

  evaluatorKeys.value.forEach((evKey) => {
    const answerData = cwAnswers.value[evKey]
    if (!answerData?.answers) return
    Object.values(answerData.answers).forEach((a) => {
      if (!a) return
      indices.forEach((qIdx, i) => {
        const k = keys[qIdx]
        if (a[k] !== null && a[k] !== undefined) { qTotals[i]++; if (a[k]) qPassed[i]++ }
      })
    })
  })
  return qTotals.map((t, i) => t ? Math.round((qPassed[i] / t) * 100) : 0)
})

const severityDistribution = computed(() => {
  const counts = { Pass: 0, Low: 0, Medium: 0, High: 0, Critical: 0 }

  evaluatorKeys.value.forEach((evKey) => {
    const evVariant = getEvaluatorVariant(evKey)
    const answerData = cwAnswers.value[evKey]
    if (!answerData?.answers) return
    Object.values(answerData.answers).forEach((a) => {
      if (!a) return
      const qs = [a.q1Pass, a.q2Pass, a.q3Pass, a.q4Pass]
      const answered = qs.filter(v => v !== null && v !== undefined)
      if (answered.length === 0) return
      
      const failCount = qs.filter(v => v === false).length
      if (evVariant === 'spencer') {
        // Spencer: only Q1+Q4 matter, so max 2 failures
        const spencerFails = [a.q1Pass, a.q4Pass].filter(v => v === false).length
        if (spencerFails === 0) counts.Pass++
        else if (spencerFails === 1) counts.Medium++
        else counts.Critical++
      } else {
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

const taskSummaries = computed(() => {
  return tasks.value.map((task, tIndex) => {
    const stepResults = (task.steps || []).map((step, sIndex) => {
      const stepKey = `${tIndex}-${sIndex}`
      const qRates = [0, 0, 0, 0]
      const qTotals = [0, 0, 0, 0]
      const keys = ['q1Pass', 'q2Pass', 'q3Pass', 'q4Pass']
      let stepPassed = 0, stepTotal = 0

      evaluatorKeys.value.forEach((evKey) => {
        const answerData = cwAnswers.value[evKey]
        const a = answerData?.answers?.[stepKey]
        if (!a) return
        stepTotal++
        if (a.passed) stepPassed++
        keys.forEach((k, qi) => {
          if (a[k] !== null && a[k] !== undefined) { qTotals[qi]++; if (a[k]) qRates[qi]++ }
        })
      })

      return {
        action: step.action,
        questionRates: qTotals.map((t, qi) => t ? Math.round((qRates[qi] / t) * 100) : 0),
        passRate: stepTotal ? Math.round((stepPassed / stepTotal) * 100) : 0,
      }
    })

    const taskPassRate = stepResults.length
      ? Math.round(stepResults.reduce((s, st) => s + st.passRate, 0) / stepResults.length)
      : 0

    return { title: task.title, description: task.description || '', passRate: taskPassRate, steps: stepResults }
  })
})

const toggleExpanded = (id) => { expandedId.value = expandedId.value === id ? null : id }

const expandedDetail = computed(() => {
  if (!expandedId.value) return null
  const row = evaluatorRows.value.find((r) => r.id === expandedId.value)
  if (!row) return null

  const answerData = cwAnswers.value[expandedId.value]
  if (!answerData?.answers) return null

  const evVariant = getEvaluatorVariant(expandedId.value)

  return {
    evaluator: row.evaluator,
    variant: evVariant,
    tasks: tasks.value.map((task, tIndex) => {
      const steps = (task.steps || []).map((step, sIndex) => {
        const a = answerData.answers[`${tIndex}-${sIndex}`] || {}
        return {
          action: step.action,
          q1Pass: a.q1Pass ?? null,
          q2Pass: a.q2Pass ?? null,
          q3Pass: a.q3Pass ?? null,
          q4Pass: a.q4Pass ?? null,
          passed: a.passed ?? null,
          severity: a.severity ?? null,
          notes: a.notes || '',
        }
      })
      const passCount = steps.filter((s) => s.passed).length
      return {
        title: task.title,
        passRate: steps.length ? Math.round((passCount / steps.length) * 100) : 0,
        steps,
      }
    }),
  }
})

const severityColor = (severity) => ({ critical: 'red', high: 'deep-orange', medium: 'orange', low: 'amber' })[severity] || 'grey'

onBeforeMount(async () => {
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
