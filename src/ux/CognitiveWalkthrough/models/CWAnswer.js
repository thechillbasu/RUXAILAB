import CWTaskAnswer from './CWTaskAnswer'

export default class CWAnswer {
  constructor({
    taskAnswers,
    progress,
    total,
    submitted,
    userDocId,
    lastUpdate,
    testStarted,
  } = {}) {
    this.taskAnswers = taskAnswers ?? []
    this.progress = progress ?? 0
    this.total = total ?? 0
    this.submitted = submitted ?? false
    this.userDocId = userDocId ?? null
    this.lastUpdate = lastUpdate ?? 0
    this.testStarted = testStarted ?? false
  }

  static toCWAnswer(data) {
    return new CWAnswer({
      ...data,
      taskAnswers: (data.taskAnswers || []).map((t) =>
        CWTaskAnswer.toCWTaskAnswer(t),
      ),
    })
  }

  toFirestore() {
    return {
      taskAnswers: this.taskAnswers.map((t) => t.toFirestore()),
      progress: this.progress,
      total: this.total,
      submitted: this.submitted,
      userDocId: this.userDocId,
      lastUpdate: this.lastUpdate,
      testStarted: this.testStarted,
    }
  }
}
