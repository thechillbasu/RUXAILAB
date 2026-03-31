<template>
  <v-card flat rounded="xl" class="issue-table-card">
    <!-- Header with filter controls -->
    <v-card-title class="d-flex align-center ga-3 px-5 pt-5 pb-2">
      <v-avatar color="#FFF3E0" size="36">
        <v-icon color="#E65100" size="18">mdi-alert-decagram-outline</v-icon>
      </v-avatar>
      <span class="text-subtitle-1 font-weight-medium">Identified Issues</span>
      <v-spacer />
      <v-switch
        v-model="dedupEnabled"
        density="compact"
        hide-details
        color="primary"
        class="mr-2"
      >
        <template #label>
          <span class="text-caption text-medium-emphasis">Group Duplicates</span>
        </template>
      </v-switch>
      <v-chip size="small" variant="tonal" color="grey">{{ dedupEnabled ? groupedIssues.length + ' groups' : filteredIssues.length + ' of ' + issues.length }}</v-chip>
    </v-card-title>

    <!-- Summary Cards -->
    <v-row class="px-5 pb-2 ma-0" dense>
      <v-col v-for="sev in severityOrder" :key="sev" cols="3">
        <v-card
          flat
          rounded="lg"
          class="severity-summary-card"
          :style="{ borderLeft: `3px solid ${sevColorHex[sev]}`, background: sevBg[sev] }"
          @click="toggleFilter(sev)"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-capitalize">{{ sev }}</div>
                <div class="text-h6 font-weight-bold">{{ distribution[sev] || 0 }}</div>
              </div>
              <v-icon :color="sevColorHex[sev]" size="22">{{ sevIcons[sev] }}</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Bar -->
    <v-row class="px-5 pb-2 ma-0" dense>
      <v-col cols="5">
        <v-text-field
          v-model="searchText"
          density="compact"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search issues..."
          hide-details
          clearable
          bg-color="white"
        />
      </v-col>
      <v-col cols="4">
        <v-select
          v-model="selectedSeverities"
          :items="severityOrder"
          density="compact"
          variant="outlined"
          rounded="lg"
          label="Filter by severity"
          hide-details
          multiple
          chips
          closable-chips
          clearable
          bg-color="white"
        >
          <template #chip="{ item }">
            <SeverityBadge :severity="item.value" :label="item.title" />
          </template>
        </v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          density="compact"
          variant="outlined"
          rounded="lg"
          label="Sort by"
          hide-details
          bg-color="white"
        />
      </v-col>
    </v-row>

    <v-divider class="mx-5 mt-1" />

    <!-- Empty State -->
    <v-card-text v-if="filteredIssues.length === 0" class="text-center pa-10">
      <v-icon size="56" color="#A5D6A7" class="mb-3">mdi-check-circle-outline</v-icon>
      <div class="text-body-1 text-medium-emphasis">
        {{ issues.length === 0 ? 'No issues found — all items passed!' : 'No issues match your filters.' }}
      </div>
    </v-card-text>

    <!-- Issues List (Normal Mode) -->
    <v-list v-else-if="!dedupEnabled" class="pa-3 px-5" bg-color="transparent">
      <v-list-item
        v-for="(issue, idx) in filteredIssues"
        :key="idx"
        class="mb-2 pa-0"
      >
        <v-card
          flat
          rounded="lg"
          :style="{ borderLeft: `3px solid ${sevColorHex[issue.severity]}` }"
          class="issue-row"
        >
          <v-card-text class="pa-3" @click="toggleExpand(idx)" style="cursor: pointer">
            <v-row align="center" dense>
              <v-col cols="auto">
                <SeverityBadge :severity="issue.severity" />
              </v-col>
              <v-col cols="auto">
                <v-chip size="small" variant="tonal" :color="issue.type === 'cognitive_walkthrough' ? '#5E35B1' : '#E65100'">
                  <v-icon start size="14">{{ issue.type === 'cognitive_walkthrough' ? 'mdi-brain' : 'mdi-clipboard-check-outline' }}</v-icon>
                  {{ issue.type === 'cognitive_walkthrough' ? 'CW' : 'HE' }}
                </v-chip>
                <v-chip v-if="issue.variant === 'spencer'" size="x-small" variant="tonal" color="orange" class="ml-1">
                  2Q
                </v-chip>
                <v-chip v-else-if="issue.type === 'cognitive_walkthrough'" size="x-small" variant="tonal" color="brown" class="ml-1">
                  4Q
                </v-chip>
              </v-col>
              <v-col>
                <div class="text-body-2 font-weight-medium">{{ issue.category }}</div>
                <div class="text-caption text-medium-emphasis">{{ issue.location }} — {{ issue.description }}</div>
              </v-col>
              <v-col cols="auto">
                <v-icon size="20" class="text-medium-emphasis">{{ expandedRows.has(idx) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Expanded Detail -->
          <v-expand-transition>
            <div v-if="expandedRows.has(idx)">
              <v-divider />
              <v-card-text class="pa-4" style="background: #fafbfd">
                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis mb-1">Evaluator</div>
                    <div class="text-body-2">{{ issue.evaluator }}</div>
                  </v-col>
                  <v-col v-if="issue.score != null" cols="6">
                    <div class="text-caption text-medium-emphasis mb-1">Score</div>
                    <div class="text-body-2">{{ issue.score }} / {{ issue.maxScore }}</div>
                  </v-col>
                </v-row>

                <!-- CW-specific Q1-Q4 breakdown -->
                <div v-if="issue.detail" class="mt-3">
                  <div class="text-caption text-medium-emphasis mb-2">Question Breakdown</div>
                  <v-row dense>
                    <template v-if="issue.variant === 'spencer'">
                      <v-col cols="6">
                        <v-chip
                          :color="issue.detail.q1 ? '#2E7D32' : '#C62828'"
                          size="small"
                          variant="tonal"
                          class="w-100 justify-center"
                        >
                          <v-icon start size="14">{{ issue.detail.q1 ? 'mdi-check' : 'mdi-close' }}</v-icon>
                          Q1: Goal
                        </v-chip>
                      </v-col>
                      <v-col cols="6">
                        <v-chip
                          :color="issue.detail.q4 ? '#2E7D32' : '#C62828'"
                          size="small"
                          variant="tonal"
                          class="w-100 justify-center"
                        >
                          <v-icon start size="14">{{ issue.detail.q4 ? 'mdi-check' : 'mdi-close' }}</v-icon>
                          Q2: Feedback
                        </v-chip>
                      </v-col>
                    </template>
                    <template v-else>
                      <v-col v-for="(val, qKey) in issue.detail" :key="qKey" cols="3">
                        <v-chip
                          :color="val ? '#2E7D32' : '#C62828'"
                          size="small"
                          variant="tonal"
                          class="w-100 justify-center"
                        >
                          <v-icon start size="14">{{ val ? 'mdi-check' : 'mdi-close' }}</v-icon>
                          {{ qKey.toUpperCase() }}
                        </v-chip>
                      </v-col>
                    </template>
                  </v-row>
                </div>

                <div v-if="issue.notes" class="mt-3">
                  <div class="text-caption text-medium-emphasis mb-1">Notes</div>
                  <div class="text-body-2">{{ issue.notes }}</div>
                </div>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-list-item>
    </v-list>

    <!-- Grouped List -->
    <v-list v-else-if="dedupEnabled" class="pa-3 px-5" bg-color="transparent">
      <div v-for="group in groupedIssues" :key="group.key" class="mb-3 pa-0">
        <v-card
          flat
          rounded="lg"
          :style="{ borderLeft: `3px solid ${sevColorHex[group.worstSeverity]}` }"
          class="issue-row"
        >
          <v-card-text class="pa-3" @click="toggleExpand(group.key)" style="cursor: pointer">
            <v-row align="center" dense>
              <v-col cols="auto">
                <SeverityBadge :severity="group.worstSeverity" />
              </v-col>
              <v-col cols="auto">
                <v-chip size="small" variant="tonal" :color="group.issues[0].type === 'cognitive_walkthrough' ? '#5E35B1' : '#E65100'">
                  <v-icon start size="14">{{ group.issues[0].type === 'cognitive_walkthrough' ? 'mdi-brain' : 'mdi-clipboard-check-outline' }}</v-icon>
                  {{ group.issues[0].type === 'cognitive_walkthrough' ? 'CW' : 'HE' }}
                </v-chip>
              </v-col>
              <v-col>
                <div class="text-body-2 font-weight-medium">{{ group.issues[0].category }}</div>
                <div class="text-caption text-medium-emphasis">{{ group.issues[0].location }} — {{ group.issues[0].description }}</div>
              </v-col>
              <v-col cols="auto">
                <v-chip size="x-small" variant="tonal" color="blue-grey">
                  <v-icon start size="12">mdi-account-group</v-icon>
                  {{ group.issues.length }} evaluator{{ group.issues.length !== 1 ? 's' : '' }}
                </v-chip>
              </v-col>
              <v-col cols="auto">
                <v-icon size="20" class="text-medium-emphasis">{{ expandedRows.has(group.key) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-col>
            </v-row>
          </v-card-text>

          <v-expand-transition>
            <div v-if="expandedRows.has(group.key)">
              <v-divider />
              <v-card-text class="pa-4" style="background: #fafbfd">
                <v-card
                  v-for="(issue, idx) in group.issues"
                  :key="idx"
                  flat
                  rounded="md"
                  class="mb-2 pa-3 border"
                  style="background: white"
                >
                  <div class="d-flex align-center mb-2">
                    <span class="text-body-2 font-weight-medium mr-2">{{ issue.evaluator }}</span>
                    <SeverityBadge :severity="issue.severity" size="x-small" />
                    <v-chip v-if="issue.variant === 'spencer'" size="x-small" variant="tonal" color="orange" class="ml-1">2Q</v-chip>
                    <v-chip v-else-if="issue.type === 'cognitive_walkthrough'" size="x-small" variant="tonal" color="brown" class="ml-1">4Q</v-chip>
                  </div>

                  <!-- Question Breakdown -->
                  <div v-if="issue.detail" class="d-flex ga-1 flex-wrap mb-1">
                    <template v-if="issue.variant === 'spencer'">
                      <v-chip :color="issue.detail.q1 ? 'success' : 'error'" size="x-small" variant="outlined">Q1: {{ issue.detail.q1 ? 'Y' : 'N' }}</v-chip>
                      <v-chip :color="issue.detail.q4 ? 'success' : 'error'" size="x-small" variant="outlined">Q2: {{ issue.detail.q4 ? 'Y' : 'N' }}</v-chip>
                    </template>
                    <template v-else>
                      <v-chip v-for="(val, qKey) in issue.detail" :key="qKey" :color="val ? 'success' : 'error'" size="x-small" variant="outlined">
                        {{ qKey.toUpperCase() }}: {{ val ? 'Y' : 'N' }}
                      </v-chip>
                    </template>
                  </div>

                  <div v-if="issue.notes" class="text-caption text-medium-emphasis mt-1">{{ issue.notes }}</div>
                </v-card>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </div>
    </v-list>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import SeverityBadge from '@/shared/components/SeverityBadge.vue'

const props = defineProps({
  issues: {
    type: Array,
    default: () => [],
  },
})

const searchText = ref('')
const selectedSeverities = ref([])
const sortBy = ref('severity')
const expandedRows = ref(new Set())
const dedupEnabled = ref(false)

const severityOrder = ['critical', 'high', 'medium', 'low']
const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
const sortOptions = [
  { title: 'Severity', value: 'severity' },
  { title: 'Category', value: 'category' },
  { title: 'Evaluator', value: 'evaluator' },
  { title: 'Type', value: 'type' },
]

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

const filteredIssues = computed(() => {
  let result = [...props.issues]
  if (selectedSeverities.value.length > 0) {
    result = result.filter((i) => selectedSeverities.value.includes(i.severity))
  }
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter((i) =>
      (i.category || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.notes || '').toLowerCase().includes(q) ||
      (i.evaluator || '').toLowerCase().includes(q),
    )
  }
  result.sort((a, b) => {
    if (sortBy.value === 'severity') {
      return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0)
    }
    return (a[sortBy.value] || '').localeCompare(b[sortBy.value] || '')
  })
  return result
})

const toggleExpand = (idx) => {
  if (expandedRows.value.has(idx)) {
    expandedRows.value.delete(idx)
  } else {
    expandedRows.value.add(idx)
  }
  expandedRows.value = new Set(expandedRows.value)
}

const toggleFilter = (sev) => {
  const idx = selectedSeverities.value.indexOf(sev)
  if (idx >= 0) {
    selectedSeverities.value.splice(idx, 1)
  } else {
    selectedSeverities.value.push(sev)
  }
}

// Simple location-based grouping: same location = same problem
const groupedIssues = computed(() => {
  const map = new Map()
  filteredIssues.value.forEach((issue) => {
    const key = issue.location || `${issue.category}-${issue.description}`
    if (!map.has(key)) {
      map.set(key, { key, issues: [], worstSeverity: 'low' })
    }
    const group = map.get(key)
    group.issues.push(issue)
    // Track worst severity for sorting/display
    if ((severityWeight[issue.severity] || 0) > (severityWeight[group.worstSeverity] || 0)) {
      group.worstSeverity = issue.severity
    }
  })

  // Sort groups by worst severity
  const groups = Array.from(map.values())
  if (sortBy.value === 'severity') {
    groups.sort((a, b) => (severityWeight[b.worstSeverity] || 0) - (severityWeight[a.worstSeverity] || 0))
  } else {
    groups.sort((a, b) => (a.issues[0]?.[sortBy.value] || '').localeCompare(b.issues[0]?.[sortBy.value] || ''))
  }
  return groups
})
</script>

<style scoped>
.issue-table-card {
  background: #f8f9fc;
}
.severity-summary-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.severity-summary-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}
.issue-row {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}
.issue-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
</style>
