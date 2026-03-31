export default class CWStepAnswer {
  constructor({
    stepId,
    q1Pass,
    q2Pass,
    q3Pass,
    q4Pass,
    notes,
    severity,
    passed,
  } = {}) {
    this.stepId = stepId
    this.q1Pass = q1Pass ?? null
    this.q2Pass = q2Pass ?? null
    this.q3Pass = q3Pass ?? null
    this.q4Pass = q4Pass ?? null
    this.notes = notes ?? ''
    this.severity = severity ?? null
    this.passed = passed ?? null
  }

  calculate() {
    const answers = [this.q1Pass, this.q2Pass, this.q3Pass, this.q4Pass]
    const answered = answers.filter((a) => a !== null)
    if (answered.length < 4) return

    const failCount = answers.filter((a) => a === false).length
    this.passed = failCount === 0

    if (failCount === 0) this.severity = null
    else if (failCount === 1) this.severity = 'low'
    else if (failCount === 2) this.severity = 'medium'
    else if (failCount === 3) this.severity = 'high'
    else this.severity = 'critical'
  }

  isComplete() {
    return [this.q1Pass, this.q2Pass, this.q3Pass, this.q4Pass].every(
      (a) => a !== null,
    )
  }

  toFirestore() {
    return {
      stepId: this.stepId,
      q1Pass: this.q1Pass,
      q2Pass: this.q2Pass,
      q3Pass: this.q3Pass,
      q4Pass: this.q4Pass,
      notes: this.notes,
      severity: this.severity,
      passed: this.passed,
    }
  }
}
