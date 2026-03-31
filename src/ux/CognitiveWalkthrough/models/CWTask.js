import CWStep from './CWStep'

export default class CWTask {
  constructor({ id, title, description, steps } = {}) {
    this.id = id
    this.title = title ?? ''
    this.description = description ?? ''
    this.steps = steps ?? []
  }

  static toCWTask(data) {
    return new CWTask({
      ...data,
      steps: (data.steps || []).map((s) => new CWStep(s)),
    })
  }

  toFirestore() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      steps: this.steps.map((s) => s.toFirestore()),
    }
  }
}
