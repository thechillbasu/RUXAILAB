/**
 * CW Results Adapter
 *
 * Converts cognitive walkthrough answers into the shared Issue format
 * so they can be rendered by the shared IssueTable component.
 *
 * Issue shape:
 *   { type, category, location, description, severity, notes, evaluator, variant, detail }
 */

/**
 * Detect the CW variant used by an evaluator.
 * @param {Object} evalData - The evaluator's answer data
 * @param {Object} test - The test object (may have cwVariant)
 * @returns {'spencer'|'wharton'}
 */
function detectEvaluatorVariant(evalData, test) {
  if (evalData?.cwVariant) return evalData.cwVariant
  // Fallback: if Q2/Q3 are always auto-true, it's a Spencer submission
  if (evalData?.answers) {
    const vals = Object.values(evalData.answers)
    const allQ2True = vals.every(a => a?.q2Pass === true)
    const allQ3True = vals.every(a => a?.q3Pass === true)
    const someQ1Answered = vals.some(a => a?.q1Pass !== null && a?.q1Pass !== undefined)
    if (someQ1Answered && allQ2True && allQ3True) return 'spencer'
  }
  return test?.cwVariant === 'spencer' ? 'spencer' : 'wharton'
}

/**
 * Calculate severity for a step answer based on the variant.
 * @param {Object} stepAnswer - The step's answer data
 * @param {'spencer'|'wharton'} variant
 * @returns {string} severity label
 */
function computeSeverity(stepAnswer, variant) {
  if (variant === 'spencer') {
    const fails = [stepAnswer.q1Pass, stepAnswer.q4Pass].filter(v => v === false).length
    if (fails === 0) return 'pass'
    if (fails === 1) return 'medium'
    return 'critical'
  }
  // Wharton 4Q
  const fails = [stepAnswer.q1Pass, stepAnswer.q2Pass, stepAnswer.q3Pass, stepAnswer.q4Pass].filter(v => v === false).length
  if (fails === 0) return 'pass'
  if (fails === 1) return 'low'
  if (fails === 2) return 'medium'
  if (fails === 3) return 'high'
  return 'critical'
}

/**
 * Convert CW answer document + test structure into a flat issues array.
 *
 * @param {Object} answerDoc - The testAnswerDocument from the store (has cwAnswers)
 * @param {Object} test - The test object (has testStructure with tasks/steps or demoTasks)
 * @returns {Array} Array of Issue objects
 */
export function toIssues(answerDoc, test) {
  const issues = []
  if (!answerDoc?.cwAnswers) return issues

  // Get task structure from the test (support both testStructure and demoTasks)
  const tasks = test?.testStructure || []

  Object.entries(answerDoc.cwAnswers).forEach(([userId, evalData]) => {
    if (!evalData?.answers) return

    const variant = detectEvaluatorVariant(evalData, test)

    Object.entries(evalData.answers).forEach(([key, stepAnswer]) => {
      // Only include failed steps
      if (stepAnswer.passed === true) return
      if (stepAnswer.passed == null) return // unanswered

      const [taskIdx, stepIdx] = key.split('-').map(Number)
      const task = tasks[taskIdx]
      const step = task?.steps?.[stepIdx]

      // Compute severity from answers instead of using stored value
      const severity = computeSeverity(stepAnswer, variant)

      issues.push({
        type: 'cognitive_walkthrough',
        category: task?.title || task?.name || `Task ${taskIdx + 1}`,
        location: `Task ${taskIdx + 1}, Step ${stepIdx + 1}`,
        description: step?.action || step?.description || `Step ${stepIdx + 1}`,
        severity,
        notes: stepAnswer.notes || '',
        evaluator: evalData.userDocId || userId,
        variant,
        detail: {
          q1: stepAnswer.q1Pass,
          q2: stepAnswer.q2Pass,
          q3: stepAnswer.q3Pass,
          q4: stepAnswer.q4Pass,
        },
      })
    })
  })

  return issues
}

/**
 * Get severity distribution counts from issues.
 * @param {Array} issues
 * @returns {Object} { critical, high, medium, low, total }
 */
export function getSeverityDistribution(issues) {
  const dist = { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
  issues.forEach((issue) => {
    if (dist[issue.severity] !== undefined) {
      dist[issue.severity]++
    }
    dist.total++
  })
  return dist
}
