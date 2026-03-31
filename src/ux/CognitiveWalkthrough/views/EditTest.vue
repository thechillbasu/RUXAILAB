<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-1">
      <div class="text-h4">Edit Test</div>
      <v-chip color="brown" variant="tonal" size="small">
        <v-icon start size="14">mdi-brain</v-icon>
        Cognitive Walkthrough
      </v-chip>
    </div>
    <div class="text-subtitle-1 text-grey mb-4">
      Configure persona, tasks and steps for your cognitive walkthrough evaluation
    </div>

    <v-tabs v-model="activeTab" color="brown">
      <v-tab value="persona">
        <v-icon start>mdi-account</v-icon>
        Persona
      </v-tab>
      <v-tab value="tasks">
        <v-icon start>mdi-format-list-checks</v-icon>
        Tasks
        <v-chip v-if="tasks.length" size="x-small" class="ml-2" color="brown" variant="tonal">
          {{ tasks.length }}
        </v-chip>
      </v-tab>
      <v-tab value="variant">
        <v-icon start>mdi-swap-horizontal</v-icon>
        Variant
      </v-tab>
      <v-tab value="settings">
        <v-icon start>mdi-cog</v-icon>
        Settings
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <v-window-item value="persona">
        <CWPersonaForm :persona="persona" @update:persona="updatePersona" />
      </v-window-item>

      <v-window-item value="tasks">
        <CWTaskBuilder :tasks="tasks" @update:tasks="updateTasks" />
      </v-window-item>

      <v-window-item value="variant">
        <v-card class="pa-6" elevation="1">
          <div class="text-h5 mb-2">Evaluation Variant</div>
          <div class="text-body-2 text-grey mb-6">
            Choose which cognitive walkthrough method evaluators will use. This determines the number of questions per step and how severity is calculated.
          </div>

          <v-row class="mb-6">
            <!-- Wharton Card -->
            <v-col cols="12" md="6">
              <v-card
                :variant="selectedVariant === 'wharton' || selectedVariant === 'both' ? 'elevated' : 'outlined'"
                :class="{ 'variant-selected': selectedVariant === 'wharton' }"
                class="pa-5 fill-height variant-card"
                :style="selectedVariant === 'wharton' ? 'border: 2px solid #5D4037' : ''"
                @click="selectedVariant = 'wharton'"
              >
                <div class="d-flex align-center mb-3">
                  <v-avatar color="brown" size="36" class="mr-3">
                    <v-icon color="white" size="20">mdi-clipboard-text</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Wharton (4Q)</div>
                    <div class="text-caption text-medium-emphasis">Traditional — Thorough Analysis</div>
                  </div>
                  <v-spacer />
                  <v-radio-group v-model="selectedVariant" hide-details class="ma-0 pa-0" inline>
                    <v-radio value="wharton" color="brown" />
                  </v-radio-group>
                </div>

                <v-divider class="mb-3" />

                <div class="text-body-2 mb-3">
                  The original Cognitive Walkthrough method developed by Wharton et al. (1994). Evaluates <strong>4 questions</strong> per step, providing deep insight into the user's cognitive process.
                </div>

                <div class="text-caption font-weight-bold text-medium-emphasis mb-2">THE 4 QUESTIONS</div>
                <v-list density="compact" class="bg-transparent pa-0">
                  <v-list-item class="px-0" style="min-height: 32px">
                    <template #prepend>
                      <v-chip color="brown" size="x-small" class="mr-2">Q1</v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">Will the user try to achieve the right effect?</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0" style="min-height: 32px">
                    <template #prepend>
                      <v-chip color="brown" size="x-small" class="mr-2">Q2</v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">Will the user notice that the correct action is available?</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0" style="min-height: 32px">
                    <template #prepend>
                      <v-chip color="brown" size="x-small" class="mr-2">Q3</v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">Will the user associate the correct action with the desired effect?</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0" style="min-height: 32px">
                    <template #prepend>
                      <v-chip color="brown" size="x-small" class="mr-2">Q4</v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">Will the user see that progress is being made toward their goal?</v-list-item-title>
                  </v-list-item>
                </v-list>

                <div class="text-caption font-weight-bold text-medium-emphasis mt-4 mb-2">SEVERITY SCALE</div>
                <v-table density="compact">
                  <tbody>
                    <tr><td><v-chip color="success" size="x-small">Pass</v-chip></td><td class="text-caption">0 No answers</td></tr>
                    <tr><td><v-chip color="amber" size="x-small">Low</v-chip></td><td class="text-caption">1 No answer</td></tr>
                    <tr><td><v-chip color="orange" size="x-small">Medium</v-chip></td><td class="text-caption">2 No answers</td></tr>
                    <tr><td><v-chip color="deep-orange" size="x-small">High</v-chip></td><td class="text-caption">3 No answers</td></tr>
                    <tr><td><v-chip color="red" size="x-small">Critical</v-chip></td><td class="text-caption">4 No answers</td></tr>
                  </tbody>
                </v-table>

                <v-chip color="brown" variant="tonal" size="small" class="mt-3">
                  <v-icon start size="14">mdi-school</v-icon>
                  Best for: Deep usability research, academic studies
                </v-chip>
              </v-card>
            </v-col>

            <!-- Spencer Card -->
            <v-col cols="12" md="6">
              <v-card
                :variant="selectedVariant === 'spencer' || selectedVariant === 'both' ? 'elevated' : 'outlined'"
                :class="{ 'variant-selected': selectedVariant === 'spencer' }"
                class="pa-5 fill-height variant-card"
                :style="selectedVariant === 'spencer' ? 'border: 2px solid #E65100' : ''"
                @click="selectedVariant = 'spencer'"
              >
                <div class="d-flex align-center mb-3">
                  <v-avatar color="orange" size="36" class="mr-3">
                    <v-icon color="white" size="20">mdi-lightning-bolt</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Spencer (2Q)</div>
                    <div class="text-caption text-medium-emphasis">Streamlined — Fast & Agile</div>
                  </div>
                  <v-spacer />
                  <v-radio-group v-model="selectedVariant" hide-details class="ma-0 pa-0" inline>
                    <v-radio value="spencer" color="orange" />
                  </v-radio-group>
                </div>

                <v-divider class="mb-3" />

                <div class="text-body-2 mb-3">
                  A streamlined variant proposed by Spencer (2000) that reduces the evaluation to <strong>2 core questions</strong> — focusing on goal understanding and feedback recognition. Ideal for iterative/agile development cycles.
                </div>

                <div class="text-caption font-weight-bold text-medium-emphasis mb-2">THE 2 QUESTIONS</div>
                <v-list density="compact" class="bg-transparent pa-0">
                  <v-list-item class="px-0" style="min-height: 32px">
                    <template #prepend>
                      <v-chip color="orange" size="x-small" class="mr-2">Q1</v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">Will the user try to achieve the right effect? <span class="text-caption text-grey">(Goal)</span></v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0" style="min-height: 32px">
                    <template #prepend>
                      <v-chip color="orange" size="x-small" class="mr-2">Q2</v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">Will the user see that progress is being made? <span class="text-caption text-grey">(Feedback)</span></v-list-item-title>
                  </v-list-item>
                </v-list>

                <div class="text-caption font-weight-bold text-medium-emphasis mt-4 mb-2">SEVERITY SCALE</div>
                <v-table density="compact">
                  <tbody>
                    <tr><td><v-chip color="success" size="x-small">Pass</v-chip></td><td class="text-caption">0 No answers — Step works perfectly</td></tr>
                    <tr><td><v-chip color="orange" size="x-small">Medium</v-chip></td><td class="text-caption">1 No answer — One cognitive barrier</td></tr>
                    <tr><td><v-chip color="red" size="x-small">Critical</v-chip></td><td class="text-caption">2 No answers — Both checks failed</td></tr>
                  </tbody>
                </v-table>

                <v-chip color="orange" variant="tonal" size="small" class="mt-3">
                  <v-icon start size="14">mdi-rocket-launch</v-icon>
                  Best for: Agile sprints, rapid iteration, lean UX
                </v-chip>
              </v-card>
            </v-col>
          </v-row>

          <!-- Both Option -->
          <v-card variant="outlined" class="pa-4 mb-4" :style="selectedVariant === 'both' ? 'border: 2px solid #546E7A' : ''" @click="selectedVariant = 'both'">
            <div class="d-flex align-center">
              <v-avatar color="blue-grey" size="36" class="mr-3">
                <v-icon color="white" size="20">mdi-swap-horizontal</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Both (Evaluator Picks)</div>
                <div class="text-body-2 text-medium-emphasis">
                  Let each evaluator choose their preferred variant when starting the evaluation. Useful for comparing results across methods.
                </div>
              </div>
              <v-spacer />
              <v-radio-group v-model="selectedVariant" hide-details class="ma-0 pa-0" inline>
                <v-radio value="both" color="blue-grey" />
              </v-radio-group>
            </div>
          </v-card>

          <v-alert type="info" variant="tonal" density="compact" class="mt-4">
            <strong>Note:</strong> Changing the variant after evaluators have submitted does not affect their existing data. New evaluators will use the updated variant.
          </v-alert>
        </v-card>
      </v-window-item>

      <v-window-item value="settings">
        <v-card class="pa-6" elevation="1">
          <div class="text-h5 mb-4">Settings</div>

          <v-row>
            <v-col cols="12" md="6">
              <v-card class="pa-4" variant="outlined">
                <div class="text-subtitle-2 mb-2">Import from CSV</div>
                <div class="text-body-2 text-grey mb-3">
                  Bulk import tasks and steps from a CSV file
                </div>
                <v-btn
                  color="brown"
                  variant="outlined"
                  size="small"
                  class="mb-3"
                  @click="downloadCsvTemplate"
                >
                  <v-icon start>mdi-download</v-icon>
                  Download Template
                </v-btn>
                <v-file-input
                  label="Import CSV"
                  prepend-icon="mdi-paperclip"
                  variant="outlined"
                  density="compact"
                  accept=".csv"
                />
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="pa-4" variant="outlined">
                <div class="text-subtitle-2 mb-2">Evaluation Behavior</div>
                <div class="text-body-2 text-grey mb-3">
                  Configure how evaluators interact with the walkthrough
                </div>
                <v-switch
                  v-model="evalSettings.showExpectedResponses"
                  label="Show step expected responses to evaluators"
                  color="brown"
                  density="compact"
                  hide-details
                />
                <v-switch
                  v-model="evalSettings.requireNotesOnFailure"
                  label="Require notes for failed steps"
                  color="brown"
                  density="compact"
                  hide-details
                  class="mt-2"
                />
                <v-switch
                  v-model="evalSettings.enableStepTimer"
                  label="Enable per-task timer"
                  color="brown"
                  density="compact"
                  hide-details
                  class="mt-2"
                />
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" md="6">
              <v-card class="pa-4" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <v-icon color="brown" size="18" class="mr-2">mdi-file-upload-outline</v-icon>
                  <div class="text-subtitle-2">Document Upload Limits</div>
                </div>
                <div class="text-body-2 text-grey mb-3">
                  Control how many and how large files evaluators can attach per step
                </div>
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="evalSettings.maxAttachmentSizeMb"
                      label="Max file size (MB)"
                      type="number"
                      variant="outlined"
                      density="compact"
                      min="1"
                      max="100"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="evalSettings.maxAttachmentsPerStep"
                      label="Max files per step"
                      type="number"
                      variant="outlined"
                      density="compact"
                      min="1"
                      max="20"
                      hide-details
                    />
                  </v-col>
                </v-row>
                <div class="text-caption text-medium-emphasis mt-2">
                  Evaluators can attach up to {{ evalSettings.maxAttachmentsPerStep }} files
                  ({{ evalSettings.maxAttachmentSizeMb }}MB each) per step
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-window-item>
    </v-window>

    <v-btn
      position="fixed"
      location="bottom right"
      color="brown"
      icon="mdi-content-save"
      size="large"
      class="mb-10 mr-5"
      elevation="4"
      @click="saveTest"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import CWPersonaForm from '@/ux/CognitiveWalkthrough/components/CWPersonaForm.vue'
import CWTaskBuilder from '@/ux/CognitiveWalkthrough/components/CWTaskBuilder.vue'
import { showSuccess } from '@/shared/utils/toast'

const store = useStore()
const activeTab = ref('persona')

const selectedVariant = ref('both') // 'wharton' | 'spencer' | 'both'

const evalSettings = reactive({
  showExpectedResponses: true,
  requireNotesOnFailure: false,
  enableStepTimer: true,
  maxAttachmentSizeMb: 10,
  maxAttachmentsPerStep: 5,
})

const test = computed(() => store.getters.test)

const persona = ref({
  name: 'First-time online shopper',
  experience: 'Novice — No prior experience',
  goals: 'Purchase a birthday gift for a friend using the e-commerce platform for the first time.',
})

const tasks = ref([
  {
    id: 1,
    title: 'Purchase a Product',
    description: 'Evaluate whether a first-time user can successfully purchase an item from the homepage.',
    steps: [
      { id: 1, action: 'Search for a product using the search bar', expectedResponse: 'Search results appear with relevant products' },
      { id: 2, action: 'Select a product from the results', expectedResponse: 'Product detail page loads with price and description' },
      { id: 3, action: 'Add the product to cart', expectedResponse: 'Cart icon updates and shows confirmation' },
      { id: 4, action: 'Proceed to checkout', expectedResponse: 'Checkout page appears with order summary' },
    ],
  },
  {
    id: 2,
    title: 'Create an Account',
    description: 'Evaluate the signup flow for a new user.',
    steps: [
      { id: 5, action: 'Locate the signup button', expectedResponse: 'Signup button is visible in the header' },
      { id: 6, action: 'Fill out the registration form', expectedResponse: 'Form fields are clearly labeled and validated' },
      { id: 7, action: 'Submit the registration', expectedResponse: 'Success message appears and user is logged in' },
    ],
  },
  {
    id: 3,
    title: 'Find Customer Support',
    description: 'Evaluate whether a user can locate help resources when needed.',
    steps: [
      { id: 8, action: 'Look for a help or support link', expectedResponse: 'Help link is visible in the footer or header' },
      { id: 9, action: 'Navigate to the contact page', expectedResponse: 'Contact options are displayed clearly' },
    ],
  },
])

const updatePersona = (updated) => {
  persona.value = { ...updated }
}

const updateTasks = (updated) => {
  tasks.value = [...updated]
}

const downloadCsvTemplate = () => {
  const csv = 'Task Title,Task Description,Step Action,Expected Response\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cw_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const saveTest = async () => {
  // Persist cwVariant to the study document
  if (test.value) {
    test.value.cwVariant = selectedVariant.value
    await store.dispatch('updateStudy', test.value)
  }
  showSuccess('Test saved successfully')
}

onMounted(() => {
  if (test.value?.persona) {
    persona.value = { ...test.value.persona }
  }
  if (test.value?.testStructure?.length) {
    tasks.value = [...test.value.testStructure]
  }
  if (test.value?.cwVariant) {
    selectedVariant.value = test.value.cwVariant
  }
})
</script>
