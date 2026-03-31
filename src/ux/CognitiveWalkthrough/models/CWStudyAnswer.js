import StudyAnswer from '@/shared/models/StudyAnswer'

export default class CWStudyAnswer extends StudyAnswer {
  constructor(params = {}) {
    super(params)
    this.cwAnswers = params.cwAnswers || {}
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      cwAnswers: this.cwAnswers
        ? Object.fromEntries(
            Object.entries(this.cwAnswers).map(([key, answer]) => [
              key,
              typeof answer?.toFirestore === 'function'
                ? answer.toFirestore()
                : answer,
            ]),
          )
        : {},
    })
  }
}
