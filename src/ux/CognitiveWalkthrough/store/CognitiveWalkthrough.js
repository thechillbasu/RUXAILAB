export default {
  state: {
    cwTasks: [],
    cwAnswers: {},
    cwSettings: {
      maxAttachmentSizeMb: 10,
      maxAttachmentsPerStep: 5,
      requireNotesOnFailure: false,
      showExpectedResponses: true,
      enableStepTimer: true,
    },
    currentTaskIndex: 0,
    autoSaveInProgress: false,
  },
  getters: {
    cwTasks(state) {
      return state.cwTasks
    },
    cwAnswers(state) {
      return state.cwAnswers
    },
    cwSettings(state) {
      return state.cwSettings
    },
    currentTaskIndex(state) {
      return state.currentTaskIndex
    },
    autoSaveInProgress(state) {
      return state.autoSaveInProgress
    },
  },
  mutations: {
    SET_CW_TASKS(state, payload) {
      state.cwTasks = [...payload]
    },
    SET_CW_ANSWERS(state, payload) {
      state.cwAnswers = { ...payload }
    },
    SET_CW_SETTINGS(state, payload) {
      state.cwSettings = { ...state.cwSettings, ...payload }
    },
    SET_CURRENT_TASK_INDEX(state, payload) {
      state.currentTaskIndex = payload
    },
    SET_AUTO_SAVE_IN_PROGRESS(state, payload) {
      state.autoSaveInProgress = payload
    },
    UPDATE_CW_ANSWER(state, { evaluatorId, data }) {
      state.cwAnswers = {
        ...state.cwAnswers,
        [evaluatorId]: { ...data },
      }
    },
  },
  actions: {
    setCWTasks({ commit }, payload) {
      try {
        commit('SET_CW_TASKS', payload)
      } catch {
        commit('setError', true)
      }
    },
    setCWSettings({ commit }, payload) {
      commit('SET_CW_SETTINGS', payload)
    },
    setCurrentTaskIndex({ commit }, payload) {
      commit('SET_CURRENT_TASK_INDEX', payload)
    },
    async saveCWAnswer({ commit }, { evaluatorId, answerData }) {
      commit('SET_AUTO_SAVE_IN_PROGRESS', true)
      try {
        commit('UPDATE_CW_ANSWER', { evaluatorId, data: answerData })
      } catch {
        commit('setError', true)
      } finally {
        commit('SET_AUTO_SAVE_IN_PROGRESS', false)
      }
    },
    async submitCWAnswer({ commit, state }, { evaluatorId }) {
      try {
        const answer = state.cwAnswers[evaluatorId]
        if (!answer) return
        commit('UPDATE_CW_ANSWER', {
          evaluatorId,
          data: { ...answer, submitted: true, submittedAt: Date.now() },
        })
      } catch {
        commit('setError', true)
      }
    },
  },
}
