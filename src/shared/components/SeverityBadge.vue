<template>
  <v-chip
    :color="colors[severity] || colors.default"
    :prepend-icon="icons[severity] || icons.default"
    :size="size"
    variant="tonal"
    class="severity-badge font-weight-medium"
  >
    {{ label || severity }}
  </v-chip>
</template>

<script setup>
defineProps({
  severity: {
    type: String,
    default: 'low',
    validator: (v) =>
      ['critical', 'high', 'medium', 'low', 'pass'].includes(v),
  },
  label: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'small',
  },
})

// WCAG AA compliant color mapping
const colors = {
  critical: 'error',
  high: 'deep-orange',
  medium: 'warning',
  low: 'success',
  pass: 'success',
  default: 'grey',
}

const icons = {
  critical: 'mdi-alert-circle',
  high: 'mdi-alert',
  medium: 'mdi-alert-outline',
  low: 'mdi-information-outline',
  pass: 'mdi-check-circle',
  default: 'mdi-help-circle-outline',
}
</script>

<style scoped>
.severity-badge {
  text-transform: capitalize;
  letter-spacing: 0.02em;
}
</style>
