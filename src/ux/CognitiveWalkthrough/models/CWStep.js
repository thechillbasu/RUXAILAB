export default class CWStep {
  constructor({ id, action, expectedResponse } = {}) {
    this.id = id
    this.action = action ?? ''
    this.expectedResponse = expectedResponse ?? ''
  }

  toFirestore() {
    return {
      id: this.id,
      action: this.action,
      expectedResponse: this.expectedResponse,
    }
  }
}
