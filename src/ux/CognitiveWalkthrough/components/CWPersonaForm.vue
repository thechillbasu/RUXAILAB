<template>
  <v-card class="pa-6" elevation="1">
    <div class="text-h5 mb-4">Persona</div>
    <div class="text-body-2 text-grey mb-6">
      Define the user persona that evaluators will simulate during the walkthrough.
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          :model-value="persona.name"
          label="Persona Name"
          placeholder="e.g. First-time shopper"
          variant="outlined"
          density="compact"
          @update:model-value="emit('update:persona', { ...persona, name: $event })"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          :model-value="persona.experience"
          :items="experienceLevels"
          label="Experience Level"
          variant="outlined"
          density="compact"
          @update:model-value="emit('update:persona', { ...persona, experience: $event })"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          :model-value="persona.goals"
          label="Goals & Motivation"
          placeholder="What is this persona trying to accomplish?"
          variant="outlined"
          density="compact"
          rows="3"
          @update:model-value="emit('update:persona', { ...persona, goals: $event })"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
const experienceLevels = [
  'Novice — No prior experience',
  'Beginner — Minimal experience',
  'Intermediate — Some experience',
  'Advanced — Experienced user',
]

defineProps({
  persona: { type: Object, default: () => ({ name: '', experience: '', goals: '' }) },
})

const emit = defineEmits(['update:persona'])
</script>
