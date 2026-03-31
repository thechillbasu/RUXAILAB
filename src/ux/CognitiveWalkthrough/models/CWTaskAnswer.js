import CWStepAnswer from './CWStepAnswer'

export default class CWTaskAnswer {
  constructor({ taskId, stepAnswers, timeSpent, timeSpentMs } = {}) {
    this.taskId = taskId
    this.stepAnswers = stepAnswers ?? []
    this.timeSpent = timeSpent ?? '00:00'
    this.timeSpentMs = timeSpentMs ?? 0
  }

  static toCWTaskAnswer(data) {
    return new CWTaskAnswer({
      ...data,
      stepAnswers: (data.stepAnswers || []).map((s) => new CWStepAnswer(s)),
    })
  }

  toFirestore() {
    return {
      taskId: this.taskId,
      stepAnswers: this.stepAnswers.map((s) => s.toFirestore()),
      timeSpent: this.timeSpent,
      timeSpentMs: this.timeSpentMs,
    }
  }
}
