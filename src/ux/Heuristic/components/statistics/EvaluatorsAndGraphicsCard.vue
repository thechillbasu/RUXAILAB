<template>
  <v-card flat rounded="xl" style="background: #f5f7ff" class="pb-3">
    <v-card-title class="subtitleView">
      {{ $t('HeuristicsTestAnswer.titles.evaluators') }}
    </v-card-title>
    <v-divider />
    <v-tabs
      bg-color="transparent"
      color="grey-darken-2"
      class="mt-2"
      align-tabs="center"
    >
      <v-tab
        class="tab-text"
        style="text-transform: none !important"
        @click="localInd = 0"
      >
        {{ $t('HeuristicsTestAnswer.evaluators.headers.table') }}
      </v-tab>
      <v-tab
        class="tab-text"
        style="text-transform: none !important"
        @click="localInd = 1"
      >
        {{ $t('HeuristicsTestAnswer.evaluators.headers.graphic') }}
      </v-tab>
    </v-tabs>

    <v-row justify="center">
      <!-- Table view -->
      <v-col v-if="localInd == 0" cols="10">
        <v-data-table
          density="compact"
          :headers="statistics.header"
          :items="statistics.items"
          :items-per-page="15"
          class="elevation-0 cardStyle mx-2 mt-3 mb-6"
        >
          <template #item.result="{ item }">
            <SeverityBadge
              :severity="getSeverityFromPercent(item.result)"
              :label="isNaN(item.result) ? '0.0%' : `${item.result}%`"
              size="small"
            />
          </template>
          <template #item.answered="{ item }"> {{ item.answered }}% </template>
        </v-data-table>

        <v-btn
          class="mx-2"
          size="small"
          variant="outlined"
          :loading="loading"
          :disabled="loading"
          @click="$emit('download-csv')"
        >
          Export as CSV
          <v-icon end>mdi-download</v-icon>
        </v-btn>
      </v-col>

      <!-- Graphic view -->
      <v-col v-if="localInd == 1" cols="10">
        <RadarChart
          v-if="statistics.items.length >= 3"
          :labels="
            statistics.items.map(
              (item) => `${item.evaluator} - ${item.result}%`,
            )
          "
          :data="statistics.items.map((item) => item.result)"
        />
        <v-card
          v-else
          flat
          class="mx-auto mt-10 mb-10 py-6 px-3 if-card"
          align="center"
          width="970px"
        >
          {{ $t('HeuristicsTestAnswer.evaluators.messages.graphForMoreThan3') }}
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import RadarChart from '@/shared/components/charts/RadarChart.vue'
import SeverityBadge from '@/shared/components/SeverityBadge.vue'

// Local ind — independent from parent's ind to avoid collision
const localInd = ref(0)

const props = defineProps({
  statistics: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['download-csv'])

// Severity from percentage
const getSeverityFromPercent = (value) => {
  const v = Number(value) || 0
  if (v < 25) return 'critical'
  if (v < 50) return 'high'
  if (v < 75) return 'medium'
  return 'low'
}
</script>
