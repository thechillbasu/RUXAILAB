<template>
  <v-card flat rounded="xl" class="overview-dashboard pb-4">
    <v-card-title class="subtitleView">
      Overview
    </v-card-title>
    <v-divider />

    <!-- Row 1: Overall Score + Severity Distribution + Quick Stats -->
    <v-row class="pa-5 ma-0" align="stretch">
      <!-- Overall Usability Score -->
      <v-col cols="12" md="4">
        <v-card flat rounded="xl" class="pa-6 text-center h-100 overview-card">
          <div class="section-label mb-3">OVERALL USABILITY</div>
          <v-progress-circular
            :model-value="parsePercent(result.average)"
            :size="150"
            :width="14"
            :color="getScoreColor(parsePercent(result.average))"
            class="mb-2"
          >
            <div>
              <div class="text-h5 font-weight-bold">{{ result.average }}</div>
            </div>
          </v-progress-circular>
          <v-row class="mt-3 ma-0" justify="space-around">
            <div class="text-center px-2">
              <div class="text-caption text-medium-emphasis">Max</div>
              <div class="text-body-2 font-weight-medium">{{ result.max }}</div>
            </div>
            <v-divider vertical class="my-1" />
            <div class="text-center px-2">
              <div class="text-caption text-medium-emphasis">Min</div>
              <div class="text-body-2 font-weight-medium">{{ result.min }}</div>
            </div>
            <v-divider vertical class="my-1" />
            <div class="text-center px-2">
              <div class="text-caption text-medium-emphasis">Std Dev</div>
              <div class="text-body-2 font-weight-medium">{{ result.sd }}</div>
            </div>
          </v-row>
        </v-card>
      </v-col>

      <!-- Severity Distribution Cards -->
      <v-col cols="12" md="4">
        <v-card flat rounded="xl" class="pa-5 h-100 overview-card">
          <div class="section-label mb-3">SEVERITY DISTRIBUTION</div>
          <v-row dense class="ma-0">
            <v-col v-for="sev in severityOrder" :key="sev" cols="6" class="mb-2">
              <v-card
                flat
                rounded="lg"
                :style="{ borderLeft: `3px solid ${sevColorHex[sev]}`, background: sevBg[sev] }"
                class="pa-3 sev-mini-card"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-capitalize text-medium-emphasis">{{ sev }}</div>
                    <div class="text-h6 font-weight-bold">{{ distribution[sev] }}</div>
                  </div>
                  <v-icon :color="sevColorHex[sev]" size="20" class="ml-1">{{ sevIcons[sev] }}</v-icon>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Quick Stats -->
      <v-col cols="12" md="4">
        <v-card flat rounded="xl" class="pa-5 h-100 overview-card">
          <div class="section-label mb-3">QUICK STATS</div>
          <v-list bg-color="transparent" density="compact" class="mt-1">
            <v-list-item class="px-0 mb-1">
              <template #prepend>
                <v-avatar color="#EDE7F6" size="36" class="mr-3">
                  <v-icon color="#5E35B1" size="18">mdi-account-group</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">Evaluators</v-list-item-title>
              <template #append>
                <span class="text-body-1 font-weight-bold">{{ evaluatorCount }}</span>
              </template>
            </v-list-item>
            <v-list-item class="px-0 mb-1">
              <template #prepend>
                <v-avatar color="#E3F2FD" size="36" class="mr-3">
                  <v-icon color="#1565C0" size="18">mdi-clipboard-list</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">Heuristics</v-list-item-title>
              <template #append>
                <span class="text-body-1 font-weight-bold">{{ heuristicCount }}</span>
              </template>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="#FFF3E0" size="36" class="mr-3">
                  <v-icon color="#E65100" size="18">mdi-alert-decagram</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">Total Issues</v-list-item-title>
              <template #append>
                <span class="text-body-1 font-weight-bold">{{ totalIssues }}</span>
              </template>
            </v-list-item>
            <v-divider class="my-1" />
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar :color="alphaColor" size="36" class="mr-3">
                  <v-icon color="white" size="18">mdi-shield-check</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">Inter-Rater Reliability</v-list-item-title>
              <template #append>
                <v-chip :color="alphaColor" size="small" variant="tonal">
                  α = {{ alphaResult.alpha != null ? alphaResult.alpha : 'N/A' }}
                </v-chip>
              </template>
            </v-list-item>
            <div v-if="alphaResult.interpretation" class="text-caption text-medium-emphasis px-1 mt-1" style="font-size: 10px">
              {{ alphaResult.interpretation }}
            </div>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Row 2: Per-Heuristic Score Bars -->
    <v-row class="px-5 ma-0">
      <v-col cols="12">
        <v-card flat rounded="xl" class="pa-5 overview-card">
          <div class="section-label mb-4">SCORE BY HEURISTIC</div>
          <div v-if="heuristicScores.length === 0" class="text-center text-medium-emphasis pa-4">
            <v-icon size="32" class="mb-2 text-medium-emphasis">mdi-chart-bar</v-icon>
            <div class="text-body-2">No heuristic data available yet</div>
          </div>
          <div v-for="(h, i) in heuristicScores" :key="i" class="mb-4">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-body-2 font-weight-medium text-truncate" style="max-width: 65%">{{ getHeuristicLabel(h, i) }}</span>
              <SeverityBadge :severity="h.severity" :label="`${h.percentage}%`" size="x-small" />
            </div>
            <v-progress-linear
              :model-value="h.percentage"
              :color="getScoreColor(h.percentage)"
              height="10"
              rounded
              bg-color="#ECEFF1"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Row 3: Top Issues Preview -->
    <v-row class="px-5 pb-2 ma-0 mt-1">
      <v-col cols="12">
        <v-card flat rounded="xl" class="pa-5 overview-card">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="section-label">TOP ISSUES</div>
            <v-btn
              v-if="issues.length > 5"
              size="small"
              variant="text"
              color="primary"
              @click="$emit('go-to-issues')"
            >
              View all {{ issues.length }} issues
              <v-icon end size="16">mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <div v-if="topIssues.length === 0" class="text-center pa-6">
            <v-icon size="48" color="#A5D6A7" class="mb-3">mdi-check-circle-outline</v-icon>
            <div class="text-body-1 text-medium-emphasis">All evaluations are within acceptable range</div>
          </div>
          <div v-else>
            <v-card
              v-for="(issue, idx) in topIssues"
              :key="idx"
              flat
              rounded="lg"
              class="mb-2 pa-3 issue-preview-card"
              :style="{ borderLeft: `3px solid ${sevColorHex[issue.severity]}` }"
            >
              <v-row align="center" dense>
                <v-col cols="auto">
                  <SeverityBadge :severity="issue.severity" />
                </v-col>
                <v-col>
                  <div class="text-body-2 font-weight-medium">{{ issue.category }}</div>
                  <div class="text-caption text-medium-emphasis">{{ issue.location }} — {{ issue.description }}</div>
                </v-col>
                <v-col v-if="issue.score != null" cols="auto">
                  <v-chip size="x-small" variant="outlined" color="grey">{{ issue.score }}/{{ issue.maxScore }}</v-chip>
                </v-col>
              </v-row>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Row 3: Bubble Chart -->
    <v-row v-if="issues.length > 0" class="px-5 ma-0 mt-1">
      <v-col cols="12">
        <v-card flat rounded="xl" class="pa-5 overview-card">
          <div class="section-label mb-3">SEVERITY × FREQUENCY MATRIX</div>
          <BubbleChart :issues="issues" />
        </v-card>
      </v-col>
    </v-row>

    <!-- Row 4: Heuristic Framework Selector -->
    <v-row class="px-5 ma-0 mt-1 pb-2">
      <v-col cols="12">
        <v-card flat rounded="xl" class="pa-5 overview-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="section-label mb-1">EVALUATION FRAMEWORK</div>
              <div class="text-caption text-medium-emphasis">
                {{ selectedSchemaObj?.heuristics?.length || 0 }} heuristics · {{ selectedSchemaObj?.author }} ({{ selectedSchemaObj?.year }})
              </div>
            </div>
            <v-select
              v-model="selectedSchema"
              :items="schemaOptions"
              item-value="value"
              item-title="title"
              density="compact"
              variant="outlined"
              rounded="lg"
              hide-details
              style="max-width: 360px"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </div>
          <!-- Schema heuristics preview -->
          <v-row class="mt-3" dense>
            <v-col v-for="(h, hi) in selectedSchemaObj?.heuristics?.slice(0, 5) || []" :key="hi" cols="12" md="6">
              <div class="d-flex align-center pa-2" style="background: #f8f9fc; border-radius: 8px">
                <v-avatar color="#E3F2FD" size="28" class="mr-2">
                  <span class="text-caption font-weight-bold" style="color: #1565C0">{{ h.id }}</span>
                </v-avatar>
                <span class="text-caption">{{ h.title }}</span>
              </div>
            </v-col>
            <v-col v-if="(selectedSchemaObj?.heuristics?.length || 0) > 5" cols="12" md="6">
              <div class="text-caption text-medium-emphasis pa-2">
                +{{ selectedSchemaObj.heuristics.length - 5 }} more heuristics...
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import SeverityBadge from '@/shared/components/SeverityBadge.vue'
import BubbleChart from '@/shared/components/charts/BubbleChart.vue'
import { calculateKrippendorffAlpha, buildHEDataMatrix } from '@/shared/utils/krippendorffAlpha'
import { getSchemaOptions, getSchemaById } from '@/ux/Heuristic/schemas/index'

const props = defineProps({
  result: {
    type: Object,
    default: () => ({ average: '0%', max: '0%', min: '0%', sd: '0%' }),
  },
  issues: {
    type: Array,
    default: () => [],
  },
  heuristicScores: {
    type: Array,
    default: () => [],
  },
  evaluatorCount: {
    type: Number,
    default: 0,
  },
  heuristicCount: {
    type: Number,
    default: 0,
  },
  answerDoc: {
    type: Object,
    default: () => null,
  },
})

defineEmits(['go-to-issues'])

// Heuristic schema selector
const schemaOptions = getSchemaOptions()
const selectedSchema = ref('nielsen10')
const selectedSchemaObj = computed(() => getSchemaById(selectedSchema.value))

const getHeuristicLabel = (h, index) => {
  const schema = selectedSchemaObj.value
  if (schema?.heuristics?.[index]) {
    return `${h.name}: ${schema.heuristics[index].title}`
  }
  return h.name
}

const severityOrder = ['critical', 'high', 'medium', 'low']
const sevColorHex = {
  critical: '#C62828',
  high: '#D84315',
  medium: '#EF6C00',
  low: '#2E7D32',
}
const sevBg = {
  critical: '#FFEBEE',
  high: '#FBE9E7',
  medium: '#FFF8E1',
  low: '#E8F5E9',
}
const sevIcons = {
  critical: 'mdi-alert-circle',
  high: 'mdi-alert',
  medium: 'mdi-alert-outline',
  low: 'mdi-information-outline',
}

const distribution = computed(() => {
  const d = { critical: 0, high: 0, medium: 0, low: 0 }
  props.issues.forEach((i) => { if (d[i.severity] !== undefined) d[i.severity]++ })
  return d
})

const totalIssues = computed(() => props.issues.length)

const topIssues = computed(() => {
  const weight = { critical: 4, high: 3, medium: 2, low: 1 }
  return [...props.issues]
    .sort((a, b) => (weight[b.severity] || 0) - (weight[a.severity] || 0))
    .slice(0, 5)
})

const parsePercent = (val) => {
  if (!val) return 0
  return parseFloat(String(val).replace('%', '')) || 0
}

const getScoreColor = (pct) => {
  if (pct >= 75) return '#2E7D32'
  if (pct >= 50) return '#EF6C00'
  if (pct >= 25) return '#D84315'
  return '#C62828'
}

// Krippendorff's Alpha
const alphaResult = computed(() => {
  if (!props.answerDoc) return { alpha: null, interpretation: 'Insufficient data', pairedCount: 0 }
  const matrix = buildHEDataMatrix(props.answerDoc)
  if (matrix.length < 2) return { alpha: null, interpretation: 'Need ≥2 evaluators', pairedCount: 0 }
  return calculateKrippendorffAlpha(matrix, 'ordinal')
})

const alphaColor = computed(() => {
  const a = alphaResult.value.alpha
  if (a == null) return '#9E9E9E'
  if (a >= 0.80) return '#2E7D32'
  if (a >= 0.67) return '#EF6C00'
  return '#C62828'
})
</script>

<style scoped>
.overview-dashboard {
  background: #f8f9fc;
}
.overview-card {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}
.overview-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #78909C;
}
.sev-mini-card {
  transition: transform 0.15s ease;
}
.sev-mini-card:hover {
  transform: translateY(-1px);
}
.issue-preview-card {
  background: #fafbfd;
  transition: background 0.15s ease;
}
.issue-preview-card:hover {
  background: #f0f2f8;
}
</style>
