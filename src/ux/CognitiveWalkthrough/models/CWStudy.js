import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '../../../shared/models/Study'

export default class CWStudy extends Study {
  constructor(params = {}) {
    super(params)

    this.testType = STUDY_TYPES.COGNITIVE_WALKTHROUGH
    this.cwVariant = params.cwVariant ?? 'both' // 'wharton' | 'spencer' | 'both'
    this.persona = params.persona ?? {
      name: '',
      experience: '',
      goals: '',
    }
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      cwVariant: this.cwVariant,
      persona: this.persona,
    })
  }
}
