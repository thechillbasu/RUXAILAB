<template>
  <div>
    <Snackbar />

    <!-- Submit Dialog -->
    <v-dialog v-model="submitDialog" width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-error text-white" primary-title>
          Submit Evaluation
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-3">
            You can only submit once. After submission you will not be able to modify your answers.
          </p>
          <v-alert v-if="progress < 100" type="warning" variant="tonal" class="mb-0">
            You have unanswered steps ({{ progress }}% complete). Consider completing all steps before submission.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn class="bg-grey-lighten-3" variant="text" @click="submitDialog = false">Cancel</v-btn>
          <v-btn class="bg-error text-white ml-1" variant="text" @click="submitAnswers">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Auto-save snackbar -->
    <v-snackbar v-model="showSaveSnackbar" :color="saveSnackbarColor" :timeout="1500" location="top right">
      <div class="d-flex align-center">
        <v-icon size="small" class="mr-2">{{ saveSnackbarIcon }}</v-icon>
        {{ saveSnackbarMessage }}
      </div>
    </v-snackbar>

    <!-- ===== START PAGE ===== -->
    <div v-if="phase === 'start'" class="cw-start-bg">
      <v-container fluid class="pa-8 pa-md-12" style="max-width: 1200px">
        <v-row>
          <v-col cols="12" md="7">
            <v-chip color="brown" variant="tonal" size="small" class="mb-4">
              <v-icon start size="14">mdi-brain</v-icon>
              Cognitive Walkthrough
            </v-chip>
            <h1 class="text-h3 font-weight-bold mb-3">
              {{ test?.testTitle || 'Cognitive Walkthrough' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-6" style="max-width: 560px">
              {{ test?.testDescription || 'Evaluate the learnability of a user interface by stepping through tasks as a defined persona.' }}
            </p>

            <!-- CW Variant Selector -->
            <v-card flat rounded="lg" class="pa-4 mb-5" style="background: #efebe9">
              <div class="text-caption font-weight-bold text-medium-emphasis mb-2" style="letter-spacing: 0.08em">CW VARIANT</div>
              <template v-if="studyVariantConfig === 'both'">
                <v-btn-toggle v-model="cwVariant" mandatory color="brown-darken-1" density="compact" rounded="lg">
                  <v-btn value="wharton" size="small">
                    <v-icon start size="16">mdi-clipboard-text</v-icon>
                    Wharton (4Q)
                  </v-btn>
                  <v-btn value="spencer" size="small">
                    <v-icon start size="16">mdi-lightning-bolt</v-icon>
                    Spencer (2Q)
                  </v-btn>
                </v-btn-toggle>
              </template>
              <template v-else>
                <v-chip :color="studyVariantConfig === 'spencer' ? 'orange' : 'brown'" variant="tonal" size="small">
                  <v-icon start size="14">{{ studyVariantConfig === 'spencer' ? 'mdi-lightning-bolt' : 'mdi-clipboard-text' }}</v-icon>
                  {{ studyVariantConfig === 'spencer' ? 'Spencer (2Q) — Set by manager' : 'Wharton (4Q) — Set by manager' }}
                </v-chip>
              </template>
              <div class="text-caption text-medium-emphasis mt-2">
                {{ cwVariant === 'spencer' ? 'Streamlined — 2 questions per step (faster, for Agile sprints)' : 'Traditional — 4 questions per step (thorough, for deep research)' }}
              </div>
            </v-card>

            <v-row class="mb-6">
              <v-col cols="4">
                <div class="text-h4 font-weight-bold" style="color: #5d4037">{{ demoTasks.length }}</div>
                <div class="text-body-2 text-medium-emphasis">Tasks</div>
              </v-col>
              <v-col cols="4">
                <div class="text-h4 font-weight-bold" style="color: #5d4037">{{ totalStepCount }}</div>
                <div class="text-body-2 text-medium-emphasis">Steps</div>
              </v-col>
              <v-col cols="4">
                <div class="text-h4 font-weight-bold" style="color: #5d4037">{{ activeQuestions.length }}</div>
                <div class="text-body-2 text-medium-emphasis">Questions/Step</div>
              </v-col>
            </v-row>

            <v-btn color="brown-darken-1" size="x-large" @click="phase = 'instructions'">
              Continue <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>

          <v-col cols="12" md="5">
            <v-card v-if="persona.name" class="pa-5 persona-card" elevation="2">
              <div class="d-flex align-center mb-3">
                <v-avatar color="brown-darken-1" size="44" class="mr-3">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-overline text-medium-emphasis mb-0">You are evaluating as</div>
                  <div class="text-h6 font-weight-bold">{{ persona.name }}</div>
                </div>
              </div>
              <v-chip v-if="persona.experience" color="brown" variant="tonal" size="small" class="mb-3">
                {{ persona.experience }}
              </v-chip>
              <div v-if="persona.goals" class="text-body-2 mt-1">
                <strong>Goals:</strong> {{ persona.goals }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- ===== INSTRUCTIONS PAGE ===== -->
    <div v-else-if="phase === 'instructions'" class="cw-start-bg">
      <v-container fluid class="pa-8 pa-md-12" style="max-width: 900px">
        <v-btn variant="text" class="mb-4" @click="phase = 'start'">
          <v-icon start>mdi-chevron-left</v-icon> Back
        </v-btn>

        <h2 class="text-h4 font-weight-bold mb-6">Evaluation Instructions</h2>

        <v-card class="pa-6 mb-4" elevation="2">
          <div class="text-h6 mb-3">
            <v-icon start size="20" color="brown">mdi-clipboard-text-outline</v-icon>
            Overview
          </div>
          <p class="text-body-1 mb-0">
            A Cognitive Walkthrough evaluates the <strong>learnability</strong> of an
            interface by simulating a new user's thought process as they attempt to
            complete tasks. You will step through each action and answer
            <strong>{{ activeQuestions.length }}</strong> standardised
            questions that measure whether the interface guides the user effectively.
          </p>
          <v-chip v-if="cwVariant === 'spencer'" color="brown" variant="tonal" size="small" class="mt-3">
            <v-icon start size="14">mdi-lightning-bolt</v-icon>
            Spencer Streamlined Mode — 2 questions per step
          </v-chip>
        </v-card>

        <v-card class="pa-6 mb-4" elevation="2">
          <div class="text-h6 mb-3">
            <v-icon start size="20" color="brown">mdi-help-circle-outline</v-icon>
            The {{ activeQuestions.length === 2 ? 'Two' : 'Four' }} Questions
          </div>
          <v-list density="compact" class="bg-transparent">
            <v-list-item v-for="(q, qi) in activeQuestions" :key="qi" class="px-0">
              <template #prepend>
                <v-avatar color="brown" size="28" class="mr-3">
                  <span class="text-caption text-white font-weight-bold">Q{{ qi + 1 }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium text-wrap">
                {{ q.label }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-wrap">{{ q.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="pa-6 mb-4" elevation="2">
          <div class="text-h6 mb-3">
            <v-icon start size="20" color="brown">mdi-alert-circle-outline</v-icon>
            Severity Scale
          </div>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Severity is auto-calculated based on the number of "No" answers:
          </p>
          <v-table density="compact">
            <thead>
              <tr><th>Result</th><th>No Answers</th><th>Meaning</th></tr>
            </thead>
            <tbody v-if="cwVariant === 'spencer'">
              <tr><td><v-chip color="success" size="x-small">Pass</v-chip></td><td>0</td><td>User can complete the step without issue</td></tr>
              <tr><td><v-chip color="orange" size="x-small">Medium</v-chip></td><td>1</td><td>One cognitive barrier detected</td></tr>
              <tr><td><v-chip color="red" size="x-small">Critical</v-chip></td><td>2</td><td>Both goal and feedback failed — significant problem</td></tr>
            </tbody>
            <tbody v-else>
              <tr><td><v-chip color="success" size="x-small">Pass</v-chip></td><td>0</td><td>User can complete the step without issue</td></tr>
              <tr><td><v-chip color="amber" size="x-small">Low</v-chip></td><td>1</td><td>Minor usability concern</td></tr>
              <tr><td><v-chip color="orange" size="x-small">Medium</v-chip></td><td>2</td><td>Noticeable usability problem</td></tr>
              <tr><td><v-chip color="deep-orange" size="x-small">High</v-chip></td><td>3</td><td>Significant barrier to task completion</td></tr>
              <tr><td><v-chip color="red" size="x-small">Critical</v-chip></td><td>4</td><td>Complete blocker — user cannot proceed</td></tr>
            </tbody>
          </v-table>
        </v-card>

        <v-card class="pa-6 mb-6" elevation="2">
          <div class="text-h6 mb-3">
            <v-icon start size="20" color="brown">mdi-lightbulb-outline</v-icon>
            Tips
          </div>
          <ul class="text-body-2 pl-4">
            <li class="mb-2">Stay in the persona's mindset — evaluate based on <em>their</em> knowledge, not yours.</li>
            <li class="mb-2">Use the Notes field to document why a step fails — this is valuable for reporting.</li>
            <li class="mb-2">Write a Success or Failure Story to give context to each step's outcome.</li>
            <li class="mb-2">Attach screenshots when the interface state is relevant.</li>
            <li>Your progress is auto-saved. You can also manually save using the save button.</li>
          </ul>
        </v-card>

        <div class="text-center">
          <v-btn color="brown-darken-1" size="x-large" @click="startTest">
            <v-icon start>mdi-play</v-icon> Begin Evaluation
          </v-btn>
        </div>
      </v-container>
    </div>

    <!-- ===== EVALUATION SCREEN ===== -->
    <v-card v-else class="studyCard">
      <v-layout>
        <v-navigation-drawer v-model="drawer" :rail="mini" permanent>
          <v-list-item class="pa-2">
            <template #prepend>
              <v-btn icon variant="text" size="small" @click="mini = !mini">
                <v-icon>{{ mini ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
              </v-btn>
            </template>
            <v-list-item-title v-if="!mini" class="text-subtitle-2 font-weight-bold">Progress</v-list-item-title>
            <template #append>
              <v-progress-circular :model-value="progress" :size="36" :width="4" color="brown">
                <span class="text-caption">{{ progress }}%</span>
              </v-progress-circular>
            </template>
          </v-list-item>

          <v-divider />

          <div v-if="!mini" class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <span class="text-caption font-weight-bold text-medium-emphasis">TOTAL TIME</span>
              <v-chip size="x-small" color="brown" variant="tonal">{{ formattedElapsed }}</v-chip>
            </div>
          </div>

          <v-divider v-if="!mini" />

          <v-list density="compact" nav>
            <template v-for="(task, tIndex) in demoTasks" :key="task.id">
              <v-list-subheader v-if="!mini" class="drawer-task-header">
                <span class="drawer-task-title">T{{ tIndex + 1 }}: {{ task.title }}</span>
                <v-chip size="x-small" variant="tonal" color="grey-darken-1" class="drawer-task-timer">
                  {{ formattedTaskTimeFor(tIndex) }}
                </v-chip>
              </v-list-subheader>

              <v-list-item
                v-for="(step, sIndex) in task.steps"
                :key="step.id"
                :active="currentTaskIndex === tIndex && currentStepIndex === sIndex"
                color="brown"
                @click="navigateTo(tIndex, sIndex)"
              >
                <template #prepend>
                  <v-icon :color="getStepStatusColor(tIndex, sIndex)" size="small">
                    {{ getStepStatusIcon(tIndex, sIndex) }}
                  </v-icon>
                </template>
                <v-list-item-title v-if="!mini" class="text-body-2">Step {{ sIndex + 1 }}</v-list-item-title>
                <template v-if="!mini && getStepSeverityLabel(tIndex, sIndex)" #append>
                  <v-chip :color="severityColor(getStepSeverityLabel(tIndex, sIndex))" size="x-small" variant="tonal">
                    {{ getStepSeverityLabel(tIndex, sIndex) }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-list>
        </v-navigation-drawer>

        <v-main class="evaluation-main">
          <template v-if="!showResults">
            <v-container>
              <v-row justify="center">
                <v-col cols="12" lg="10" xl="9">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="text-overline text-medium-emphasis">
                      Task {{ currentTaskIndex + 1 }} of {{ demoTasks.length }}
                      — Step {{ currentStepIndex + 1 }} of {{ currentTask.steps.length }}
                    </div>
                    <div class="d-flex align-center ga-2">
                      <v-chip color="grey" variant="tonal" size="small">
                        <v-icon start size="14">mdi-timer-outline</v-icon>
                        Task: {{ formattedTaskTimeFor(currentTaskIndex) }}
                      </v-chip>
                      <v-chip color="brown" variant="tonal" size="small">
                        <v-icon start size="14">mdi-timer</v-icon>
                        Total: {{ formattedElapsed }}
                      </v-chip>
                    </div>
                  </div>

                  <v-progress-linear :model-value="progress" color="success" height="8" rounded class="mb-4" />

                  <!-- Task + Step info -->
                  <v-card class="pa-5 mb-4" elevation="1">
                    <div class="d-flex align-center mb-2">
                      <v-chip color="brown" size="small" class="mr-3">T{{ currentTaskIndex + 1 }}</v-chip>
                      <div class="text-h6">{{ currentTask.title }}</div>
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-4">{{ currentTask.description }}</div>
                    <v-divider class="mb-4" />
                    <div class="d-flex align-center mb-2">
                      <v-avatar color="brown-darken-1" size="28" class="mr-3">
                        <span class="text-caption text-white font-weight-bold">{{ currentStepIndex + 1 }}</span>
                      </v-avatar>
                      <div class="text-subtitle-1 font-weight-bold">{{ currentStep.action }}</div>
                    </div>
                    <div class="text-body-2 text-medium-emphasis ml-10">
                      <v-icon size="14" class="mr-1">mdi-arrow-right</v-icon>
                      Expected: {{ currentStep.expectedResponse }}
                    </div>
                  </v-card>

                  <!-- CW Questions -->
                  <v-card
                    v-for="(question, qIndex) in activeQuestions"
                    :key="question.key"
                    class="pa-4 mb-3"
                    elevation="1"
                    :color="getQuestionCardColor(question.originalIndex)"
                  >
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center flex-grow-1 mr-4">
                        <v-avatar :color="getQuestionAvatarColor(question.originalIndex)" size="28" class="mr-3">
                          <span class="text-caption text-white font-weight-bold">Q{{ qIndex + 1 }}</span>
                        </v-avatar>
                        <div>
                          <div class="text-body-1 font-weight-medium">{{ question.label }}</div>
                          <div class="text-caption text-medium-emphasis">{{ question.description }}</div>
                        </div>
                      </div>
                      <v-btn-toggle
                        :model-value="getAnswer(question.originalIndex)"
                        color="brown"
                        density="compact"
                        @update:model-value="setAnswer(question.originalIndex, $event)"
                      >
                        <v-btn :value="true" variant="outlined" size="small">
                          <v-icon start size="small" color="success">mdi-check</v-icon> Yes
                        </v-btn>
                        <v-btn :value="false" variant="outlined" size="small">
                          <v-icon start size="small" color="error">mdi-close</v-icon> No
                        </v-btn>
                      </v-btn-toggle>
                    </div>
                  </v-card>

                  <!-- Severity slider with Pass -->
                  <v-card class="pa-4 mb-3" elevation="1">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <div class="text-subtitle-2">Severity Assessment</div>
                        <v-tooltip location="top" max-width="360">
                          <template #activator="{ props: tipProps }">
                            <v-icon v-bind="tipProps" size="18" color="grey" class="ml-2" style="cursor: pointer">
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <div>
                            <strong>How severity is calculated:</strong>
                            <ul v-if="cwVariant === 'spencer'" class="mt-1 pl-3" style="font-size: 12px">
                              <li><strong>Pass</strong> — All 2 Yes (0 No)</li>
                              <li><strong>Medium</strong> — 1 No</li>
                              <li><strong>Critical</strong> — 2 No</li>
                            </ul>
                            <ul v-else class="mt-1 pl-3" style="font-size: 12px">
                              <li><strong>Pass</strong> — All 4 Yes (0 No)</li>
                              <li><strong>Low</strong> — 1 No</li>
                              <li><strong>Medium</strong> — 2 No</li>
                              <li><strong>High</strong> — 3 No</li>
                              <li><strong>Critical</strong> — 4 No</li>
                            </ul>
                          </div>
                        </v-tooltip>
                      </div>
                      <v-chip :color="currentSliderColor" size="small">{{ currentSliderLabel }}</v-chip>
                    </div>
                      <v-slider
                        v-if="currentStepAnswered"
                        :model-value="currentSliderValue"
                        :ticks="sliderTicks"
                        :min="0"
                        :max="cwVariant === 'spencer' ? 2 : 4"
                        step="1"
                      show-ticks="always"
                      :color="currentSliderColor"
                      :track-color="currentSliderColor"
                      readonly
                      hide-details
                    />
                    <div v-else class="text-caption text-medium-emphasis text-center pa-2">
                      Answer all {{ activeQuestions.length }} questions to see severity
                    </div>
                  </v-card>

                  <!-- Notes with compact attachment -->
                  <v-card class="pa-4 mb-3" elevation="1">
                    <v-textarea
                      v-model="currentNotes"
                      label="Notes & Observations"
                      placeholder="Why did this step pass or fail? What would the user struggle with?"
                      variant="outlined"
                      density="compact"
                      rows="2"
                      hide-details
                    />
                    <div class="d-flex align-center mt-2">
                      <v-btn
                        variant="text"
                        density="compact"
                        size="small"
                        color="grey-darken-1"
                        @click="$refs.notesFileInput.click()"
                      >
                        <v-icon start size="16">mdi-paperclip</v-icon>
                        Attach files
                      </v-btn>
                      <input
                        ref="notesFileInput"
                        type="file"
                        multiple
                        class="d-none"
                        @change="handleNotesAttachment"
                      >
                      <template v-if="currentAttachments.length">
                        <v-chip
                          v-for="(file, fi) in currentAttachments"
                          :key="fi"
                          size="x-small"
                          closable
                          class="ml-1"
                          @click:close="removeAttachment(fi)"
                        >
                          {{ file.name }}
                        </v-chip>
                      </template>
                    </div>
                  </v-card>

                  <!-- Story with compact attachment -->
                  <v-card class="pa-4 mb-4" elevation="1">
                    <div class="text-subtitle-2 mb-2">
                      <v-icon size="16" class="mr-1">mdi-book-open-variant</v-icon>
                      {{ currentPassed === false ? 'Failure Story' : 'Success Story' }}
                    </div>
                    <v-textarea
                      v-model="currentStory"
                      :label="currentPassed === false ? 'Describe what would go wrong for the user' : 'Describe the ideal user interaction'"
                      :placeholder="currentPassed === false ? 'The user would likely... because the interface...' : 'The user successfully... because the interface clearly...'"
                      variant="outlined" density="compact" rows="2" hide-details
                    />
                    <div class="d-flex align-center mt-2">
                      <v-btn
                        variant="text"
                        density="compact"
                        size="small"
                        color="grey-darken-1"
                        @click="$refs.storyFileInput.click()"
                      >
                        <v-icon start size="16">mdi-paperclip</v-icon>
                        Attach evidence
                      </v-btn>
                      <input
                        ref="storyFileInput"
                        type="file"
                        multiple
                        class="d-none"
                        @change="handleStoryAttachment"
                      >
                      <template v-if="currentStoryAttachments.length">
                        <v-chip
                          v-for="(file, fi) in currentStoryAttachments"
                          :key="fi"
                          size="x-small"
                          closable
                          class="ml-1"
                          @click:close="removeStoryAttachment(fi)"
                        >
                          {{ file.name }}
                        </v-chip>
                      </template>
                    </div>
                  </v-card>

                  <!-- Navigation -->
                  <div class="d-flex justify-space-between">
                    <v-btn :disabled="isFirstStep" variant="outlined" @click="previousStep">
                      <v-icon start>mdi-chevron-left</v-icon> Previous
                    </v-btn>
                    <v-btn v-if="!isLastStep" color="brown-darken-1" @click="nextStep">
                      Next <v-icon end>mdi-chevron-right</v-icon>
                    </v-btn>
                    <v-btn v-else color="success" @click="finishEvaluation">
                      <v-icon start>mdi-check</v-icon> View Results
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <!-- RESULTS -->
          <template v-else>
            <v-container>
              <v-row justify="center">
                <v-col cols="12" lg="10" xl="9">
                  <div v-if="progress < 100" class="text-center pa-8">
                    <v-icon size="80" color="warning" class="mb-4">mdi-alert-circle-outline</v-icon>
                    <div class="text-h5 mb-2">Evaluation Incomplete</div>
                    <div class="text-body-1 text-medium-emphasis mb-4">
                      {{ progress }}% complete — answer all questions before submitting.
                    </div>
                    <v-btn color="brown" @click="showResults = false">Continue Evaluation</v-btn>
                  </div>

                  <div v-else>
                    <v-card class="pa-6 mb-4" elevation="1">
                      <div class="d-flex align-center justify-space-between mb-4">
                        <div class="text-h5">Learnability Analysis</div>
                        <v-chip color="brown" variant="tonal" size="small">
                          <v-icon start size="14">mdi-timer-outline</v-icon>
                          Total: {{ formattedElapsed }}
                        </v-chip>
                      </div>
                      <v-row>
                        <v-col cols="12" md="3">
                          <div class="text-center">
                            <v-progress-circular :model-value="learnabilityScore" :size="100" :width="10" :color="learnabilityScore >= 75 ? 'success' : learnabilityScore >= 50 ? 'warning' : 'error'">
                              <span class="text-h5 font-weight-bold">{{ learnabilityScore }}%</span>
                            </v-progress-circular>
                            <div class="text-subtitle-2 mt-2">Learnability</div>
                          </div>
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-card color="success" variant="tonal" class="pa-4 text-center fill-height d-flex flex-column justify-center">
                            <div class="text-h4 font-weight-bold">{{ passRate }}%</div>
                            <div class="text-subtitle-2">Pass Rate</div>
                          </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-card color="error" variant="tonal" class="pa-4 text-center fill-height d-flex flex-column justify-center">
                            <div class="text-h4 font-weight-bold">{{ totalFailures }}</div>
                            <div class="text-subtitle-2">Failures</div>
                          </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-card color="info" variant="tonal" class="pa-4 text-center fill-height d-flex flex-column justify-center">
                            <div class="text-h4 font-weight-bold">{{ totalStepCount }}</div>
                            <div class="text-subtitle-2">Evaluated</div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card>

                    <v-card class="pa-6 mb-4" elevation="1">
                      <div class="text-h6 mb-3">Question-Level Breakdown</div>
                      <v-row>
                        <v-col v-for="(q, qi) in cwQuestions" :key="qi" cols="12" md="3">
                          <div class="text-center pa-3">
                            <v-progress-circular :model-value="questionPassRates[qi]" :size="64" :width="6" :color="questionPassRates[qi] >= 75 ? 'success' : questionPassRates[qi] >= 50 ? 'warning' : 'error'">
                              <span class="text-body-2 font-weight-bold">{{ questionPassRates[qi] }}%</span>
                            </v-progress-circular>
                            <div class="text-caption mt-2">Q{{ qi + 1 }}</div>
                            <div class="text-caption text-medium-emphasis">{{ q.short }}</div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>

                    <CWResultsSummary :task-results="taskResults" />

                    <div class="text-center mt-6">
                      <v-btn color="brown" variant="outlined" class="mr-3" @click="showResults = false">
                        <v-icon start>mdi-pencil</v-icon> Edit Answers
                      </v-btn>
                      <v-btn color="success" size="large" @click="submitDialog = true">
                        <v-icon start>mdi-send</v-icon> Submit Evaluation
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </v-main>
      </v-layout>

      <!-- FAB Save Button -->
      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            color="secondary"
            size="large"
            elevation="4"
            class="fab-save"
            @click="manualSave"
          >
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
        </template>
        <span>Save</span>
      </v-tooltip>

      <!-- FAB Submit Button -->
      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            color="success"
            size="large"
            elevation="4"
            class="fab-submit text-white"
            :disabled="progress < 100"
            @click="submitDialog = true"
          >
            <v-icon>mdi-file-move</v-icon>
          </v-btn>
        </template>
        <span>Submit</span>
      </v-tooltip>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Snackbar from '@/shared/components/Snackbar.vue'
import CWResultsSummary from '@/ux/CognitiveWalkthrough/components/CWResultsSummary.vue'
import CWStepAnswer from '@/ux/CognitiveWalkthrough/models/CWStepAnswer'
import { showSuccess } from '@/shared/utils/toast'

defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()
const router = useRouter()
const test = computed(() => store.getters.test)

const cwQuestions = [
  { key: 'q1Pass', label: 'Will the user try to achieve the right effect?', description: 'Does the user understand what action is needed at this point?', short: 'Goal' },
  { key: 'q2Pass', label: 'Will the user notice that the correct action is available?', description: 'Is the correct action visible and discoverable?', short: 'Visibility' },
  { key: 'q3Pass', label: 'Will the user associate the correct action with the desired effect?', description: 'Does the action label/icon clearly suggest what it does?', short: 'Affordance' },
  { key: 'q4Pass', label: 'Will the user see that progress is being made toward their goal?', description: 'Does the system provide adequate feedback after the action?', short: 'Feedback' },
]

const demoTasks = [
  {
    id: 1, title: 'Purchase a Product',
    description: 'Evaluate whether a first-time user can successfully purchase an item from the homepage.',
    steps: [
      { id: 1, action: 'Search for a product using the search bar', expectedResponse: 'Search results appear with relevant products' },
      { id: 2, action: 'Select a product from the results', expectedResponse: 'Product detail page loads with price and description' },
      { id: 3, action: 'Add the product to cart', expectedResponse: 'Cart icon updates and shows confirmation' },
      { id: 4, action: 'Proceed to checkout', expectedResponse: 'Checkout page appears with order summary' },
    ],
  },
  {
    id: 2, title: 'Create an Account',
    description: 'Evaluate the signup flow for a new user.',
    steps: [
      { id: 5, action: 'Locate the signup button', expectedResponse: 'Signup button is visible in the header' },
      { id: 6, action: 'Fill out the registration form', expectedResponse: 'Form fields are clearly labeled and validated' },
      { id: 7, action: 'Submit the registration', expectedResponse: 'Success message appears and user is logged in' },
    ],
  },
  {
    id: 3, title: 'Find Customer Support',
    description: 'Evaluate whether a user can locate help resources when needed.',
    steps: [
      { id: 8, action: 'Look for a help or support link', expectedResponse: 'Help link is visible in the footer or header' },
      { id: 9, action: 'Navigate to the contact page', expectedResponse: 'Contact options are displayed clearly' },
    ],
  },
]

const persona = computed(() => test.value?.persona || {
  name: 'First-time online shopper',
  experience: 'Novice — No prior experience',
  goals: 'Purchase a birthday gift using the platform for the first time.',
})

// Study-level variant config ('wharton' | 'spencer' | 'both')
const studyVariantConfig = computed(() => test.value?.cwVariant || 'both')

// Active variant for this evaluator session
const cwVariant = ref('wharton')

// Sync from study config when it loads
watch(studyVariantConfig, (cfg) => {
  if (cfg === 'spencer') cwVariant.value = 'spencer'
  else if (cfg === 'wharton') cwVariant.value = 'wharton'
  // if 'both', keep whatever the evaluator chose
}, { immediate: true })

// Spencer's Streamlined CW uses only Q1 (Goal) and Q4 (Feedback)
const activeQuestions = computed(() => {
  if (cwVariant.value === 'spencer') {
    return [
      { ...cwQuestions[0], originalIndex: 0 },
      { ...cwQuestions[3], originalIndex: 3 },
    ]
  }
  return cwQuestions.map((q, i) => ({ ...q, originalIndex: i }))
})

const phase = ref('start')
const drawer = ref(true)
const mini = ref(false)
const currentTaskIndex = ref(0)
const currentStepIndex = ref(0)
const showResults = ref(false)
const submitDialog = ref(false)

const showSaveSnackbar = ref(false)
const saveSnackbarMessage = ref('All changes saved')
const saveSnackbarIcon = ref('mdi-check-circle')
const saveSnackbarColor = ref('success')

const answers = reactive({})
const stories = reactive({})
const attachments = reactive({})
const storyAttachments = reactive({})
let elapsedSeconds = ref(0)
let taskSeconds = reactive({})
let timerInterval = null

const totalStepCount = computed(() => demoTasks.reduce((acc, t) => acc + t.steps.length, 0))

const notesFileInput = ref(null)
const storyFileInput = ref(null)

const initAnswers = () => {
  demoTasks.forEach((task, tIndex) => {
    taskSeconds[tIndex] = 0
    task.steps.forEach((step, sIndex) => {
      const key = `${tIndex}-${sIndex}`
      if (!answers[key]) answers[key] = new CWStepAnswer({ stepId: step.id })
      if (!attachments[key]) attachments[key] = []
      if (!storyAttachments[key]) storyAttachments[key] = []
    })
  })
}

const currentTask = computed(() => demoTasks[currentTaskIndex.value])
const currentStep = computed(() => currentTask.value.steps[currentStepIndex.value])
const stepKey = computed(() => `${currentTaskIndex.value}-${currentStepIndex.value}`)

const currentNotes = computed({
  get: () => answers[stepKey.value]?.notes || '',
  set: (val) => { if (answers[stepKey.value]) answers[stepKey.value].notes = val },
})
const currentStory = computed({
  get: () => stories[stepKey.value] || '',
  set: (val) => { stories[stepKey.value] = val },
})
const currentAttachments = computed({
  get: () => attachments[stepKey.value] || [],
  set: (val) => { attachments[stepKey.value] = val },
})
const currentStoryAttachments = computed({
  get: () => storyAttachments[stepKey.value] || [],
  set: (val) => { storyAttachments[stepKey.value] = val },
})

const currentPassed = computed(() => answers[stepKey.value]?.passed ?? null)
const currentStepAnswered = computed(() => answers[stepKey.value]?.isComplete() ?? false)

const sliderTicks = computed(() => cwVariant.value === 'spencer'
  ? { 0: 'Pass', 1: 'Medium', 2: 'Critical' }
  : { 0: 'Pass', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' })
const sliderLabels = computed(() => cwVariant.value === 'spencer'
  ? ['Pass', 'Medium', 'Critical']
  : ['Pass', 'Low', 'Medium', 'High', 'Critical'])
const sliderColors = computed(() => cwVariant.value === 'spencer'
  ? ['success', 'orange', 'red']
  : ['success', 'amber', 'orange', 'deep-orange', 'red']
)

const currentNoCount = computed(() => {
  const a = answers[stepKey.value]
  if (!a?.isComplete()) return -1
  let count = 0
  ;['q1Pass', 'q2Pass', 'q3Pass', 'q4Pass'].forEach((q) => { if (!a[q]) count++ })
  return count
})

const currentSliderValue = computed(() => currentNoCount.value < 0 ? 0 : currentNoCount.value)
const currentSliderLabel = computed(() => currentNoCount.value < 0 ? 'Pending' : sliderLabels.value[currentNoCount.value])
const currentSliderColor = computed(() => currentNoCount.value < 0 ? 'grey' : sliderColors.value[currentNoCount.value])

const isFirstStep = computed(() => currentTaskIndex.value === 0 && currentStepIndex.value === 0)
const isLastStep = computed(() => {
  const last = demoTasks.length - 1
  return currentTaskIndex.value === last && currentStepIndex.value === demoTasks[last].steps.length - 1
})

const progress = computed(() => {
  let total = 0, completed = 0
  demoTasks.forEach((task, tIndex) => {
    task.steps.forEach((_, sIndex) => { total++; if (answers[`${tIndex}-${sIndex}`]?.isComplete()) completed++ })
  })
  return total ? Math.round((completed / total) * 100) : 0
})

const formatTime = (sec) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const formattedElapsed = computed(() => formatTime(elapsedSeconds.value))
const formattedTaskTimeFor = (tIndex) => formatTime(taskSeconds[tIndex] || 0)

const triggerAutoSave = () => {
  showSaveSnackbar.value = false
  saveSnackbarMessage.value = 'Saving...'
  saveSnackbarIcon.value = 'mdi-content-save'
  saveSnackbarColor.value = 'warning'
  showSaveSnackbar.value = true
  setTimeout(() => {
    showSaveSnackbar.value = false
    saveSnackbarMessage.value = 'All changes saved'
    saveSnackbarIcon.value = 'mdi-check-circle'
    saveSnackbarColor.value = 'success'
    showSaveSnackbar.value = true
  }, 400)
}

const learnabilityScore = computed(() => {
  let totalQs = 0, passedQs = 0
  demoTasks.forEach((task, tIndex) => {
    task.steps.forEach((_, sIndex) => {
      const a = answers[`${tIndex}-${sIndex}`]
      if (!a?.isComplete()) return
      ;['q1Pass', 'q2Pass', 'q3Pass', 'q4Pass'].forEach((q) => { totalQs++; if (a[q]) passedQs++ })
    })
  })
  return totalQs ? Math.round((passedQs / totalQs) * 100) : 0
})

const questionPassRates = computed(() => {
  return [0, 1, 2, 3].map((qi) => {
    const key = cwQuestions[qi].key
    let total = 0, passed = 0
    demoTasks.forEach((task, tIndex) => {
      task.steps.forEach((_, sIndex) => {
        const a = answers[`${tIndex}-${sIndex}`]
        if (a?.[key] !== null && a?.[key] !== undefined) { total++; if (a[key]) passed++ }
      })
    })
    return total ? Math.round((passed / total) * 100) : 0
  })
})

const totalFailures = computed(() => {
  let count = 0
  demoTasks.forEach((task, tIndex) => {
    task.steps.forEach((_, sIndex) => {
      const a = answers[`${tIndex}-${sIndex}`]
      if (a?.isComplete() && !a.passed) count++
    })
  })
  return count
})

const passRate = computed(() => {
  const total = totalStepCount.value
  return total ? Math.round(((total - totalFailures.value) / total) * 100) : 0
})

const taskResults = computed(() => {
  return demoTasks.map((task, tIndex) => ({
    title: task.title,
    passRate: (() => {
      const steps = task.steps.map((_, sIndex) => answers[`${tIndex}-${sIndex}`])
      const complete = steps.filter((s) => s?.isComplete())
      if (!complete.length) return 0
      return Math.round((complete.filter((s) => s.passed).length / complete.length) * 100)
    })(),
    steps: task.steps.map((step, sIndex) => {
      const a = answers[`${tIndex}-${sIndex}`]
      return { action: step.action, q1Pass: a?.q1Pass ?? null, q2Pass: a?.q2Pass ?? null, q3Pass: a?.q3Pass ?? null, q4Pass: a?.q4Pass ?? null, passed: a?.passed ?? null, severity: a?.severity ?? null }
    }),
  }))
})

const getAnswer = (qIndex) => {
  const a = answers[stepKey.value]
  return a ? a[cwQuestions[qIndex].key] : undefined
}

const setAnswer = (qIndex, value) => {
  if (!answers[stepKey.value]) return
  answers[stepKey.value][cwQuestions[qIndex].key] = value

  if (cwVariant.value === 'spencer') {
    // Auto-pass Q2 and Q3 (not shown to evaluator)
    answers[stepKey.value].q2Pass = true
    answers[stepKey.value].q3Pass = true
    // Spencer severity: only Q1 + Q4 matter
    const q1 = answers[stepKey.value].q1Pass
    const q4 = answers[stepKey.value].q4Pass
    if (q1 !== null && q4 !== null) {
      const failCount = [q1, q4].filter(v => v === false).length
      answers[stepKey.value].passed = failCount === 0
      if (failCount === 0) answers[stepKey.value].severity = null
      else if (failCount === 1) answers[stepKey.value].severity = 'medium'
      else answers[stepKey.value].severity = 'critical'
    }
  } else {
    answers[stepKey.value].calculate()
  }
  triggerAutoSave()
}

const manualSave = () => {
  showSaveSnackbar.value = false
  saveSnackbarMessage.value = 'Saving...'
  saveSnackbarIcon.value = 'mdi-content-save'
  saveSnackbarColor.value = 'warning'
  showSaveSnackbar.value = true
  setTimeout(() => {
    showSaveSnackbar.value = false
    saveSnackbarMessage.value = 'Progress saved'
    saveSnackbarIcon.value = 'mdi-check-circle'
    saveSnackbarColor.value = 'success'
    showSaveSnackbar.value = true
  }, 300)
}

const handleNotesAttachment = (event) => {
  const files = Array.from(event.target.files || [])
  attachments[stepKey.value] = [...(attachments[stepKey.value] || []), ...files]
}
const handleStoryAttachment = (event) => {
  const files = Array.from(event.target.files || [])
  storyAttachments[stepKey.value] = [...(storyAttachments[stepKey.value] || []), ...files]
}
const removeAttachment = (index) => {
  attachments[stepKey.value].splice(index, 1)
}
const removeStoryAttachment = (index) => {
  storyAttachments[stepKey.value].splice(index, 1)
}

const getQuestionCardColor = (qIndex) => {
  const val = getAnswer(qIndex)
  if (val === null || val === undefined) return undefined
  return val ? 'green-lighten-5' : 'red-lighten-5'
}
const getQuestionAvatarColor = (qIndex) => {
  const val = getAnswer(qIndex)
  if (val === null || val === undefined) return 'grey'
  return val ? 'success' : 'error'
}
const getStepStatusColor = (tIndex, sIndex) => {
  const a = answers[`${tIndex}-${sIndex}`]
  if (!a?.isComplete()) return 'grey'
  return a.passed ? 'success' : 'error'
}
const getStepStatusIcon = (tIndex, sIndex) => {
  const a = answers[`${tIndex}-${sIndex}`]
  if (!a?.isComplete()) return 'mdi-circle-outline'
  return a.passed ? 'mdi-check-circle' : 'mdi-close-circle'
}
const getStepSeverityLabel = (tIndex, sIndex) => {
  const a = answers[`${tIndex}-${sIndex}`]
  if (!a?.isComplete()) return null
  if (a.passed) return 'Pass'
  return a.severity || null
}
const severityColor = (label) => ({ Pass: 'success', critical: 'red', high: 'deep-orange', medium: 'orange', low: 'amber' })[label] || 'grey'

const startTest = () => { initAnswers(); phase.value = 'evaluate'; timerInterval = setInterval(() => { elapsedSeconds.value++; if (taskSeconds[currentTaskIndex.value] !== undefined) taskSeconds[currentTaskIndex.value]++ }, 1000) }
const navigateTo = (tIndex, sIndex) => { currentTaskIndex.value = tIndex; currentStepIndex.value = sIndex; showResults.value = false }
const nextStep = () => { if (currentStepIndex.value < currentTask.value.steps.length - 1) currentStepIndex.value++; else if (currentTaskIndex.value < demoTasks.length - 1) { currentTaskIndex.value++; currentStepIndex.value = 0 } }
const previousStep = () => { if (currentStepIndex.value > 0) currentStepIndex.value--; else if (currentTaskIndex.value > 0) { currentTaskIndex.value--; currentStepIndex.value = demoTasks[currentTaskIndex.value].steps.length - 1 } }
const finishEvaluation = () => { showResults.value = true }
const submitAnswers = async () => {
  submitDialog.value = false
  if (timerInterval) clearInterval(timerInterval)

  const user = store.getters.user
  const userId = user?.id || `anonymous_${Date.now()}`

  const serializedAnswers = {}
  Object.entries(answers).forEach(([key, val]) => {
    if (val && typeof val === 'object') {
      serializedAnswers[key] = {
        q1Pass: val.q1Pass ?? null,
        q2Pass: val.q2Pass ?? null,
        q3Pass: val.q3Pass ?? null,
        q4Pass: val.q4Pass ?? null,
        passed: val.passed ?? null,
        severity: val.severity ?? null,
        notes: val.notes || '',
        stepId: val.stepId || null,
      }
    }
  })

  const answerData = {
    submitted: true,
    submittedAt: new Date().toISOString(),
    progress: progress.value,
    passRate: passRate.value,
    learnabilityScore: learnabilityScore.value,
    totalTime: elapsedSeconds.value,
    lastSaveTime: new Date().toISOString(),
    userDocId: userId,
    cwVariant: cwVariant.value,
    answers: serializedAnswers,
    stories: { ...stories },
  }

  store.commit('SET_CW_ANSWER_LOCAL', { userId, data: answerData })
  console.log('[CW Submit] userId:', userId)
  console.log('[CW Submit] answerData:', JSON.stringify(answerData, null, 2))
  console.log('[CW Submit] store cwAnswers:', JSON.stringify(store.state.Answer.testAnswerDocument?.cwAnswers, null, 2))

  try {
    if (test.value?.answersDocId) {
      await store.dispatch('saveTestAnswer', {
        data: answerData,
        answersDocId: test.value.answersDocId,
        testType: test.value.testType,
      })
    }
  } catch {
    // Firestore save failed — local state already updated above
  }

  showSuccess('Evaluation submitted successfully')
  setTimeout(() => { router.push('/admin') }, 1500)
}

onBeforeUnmount(() => { if (timerInterval) clearInterval(timerInterval) })
</script>

<style scoped>
.studyCard {
  min-height: 100vh;
}
.cw-start-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #efebe9 0%, #d7ccc8 50%, #bcaaa4 100%);
  display: flex;
  align-items: center;
}
.evaluation-main {
  background-color: #efebe9;
  min-height: 100vh;
}
.persona-card {
  border-left: 4px solid #5d4037;
}
.save-status-indicator {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 100;
  transition: all 0.3s ease;
}
.save-status-indicator .status-card {
  min-width: 170px;
}
.status-mini {
  right: 8px;
}
.drawer-task-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  min-height: 32px;
  padding-right: 8px !important;
}
.drawer-task-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 4px;
}
.drawer-task-timer {
  flex-shrink: 0;
}
.fab-save {
  position: fixed !important;
  bottom: 100px;
  right: 24px;
  z-index: 100;
}
.fab-submit {
  position: fixed !important;
  bottom: 36px;
  right: 24px;
  z-index: 100;
}
</style>
