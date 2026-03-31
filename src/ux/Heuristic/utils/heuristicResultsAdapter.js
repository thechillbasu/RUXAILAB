/**
 * Heuristic Results Adapter
 *
 * Converts heuristic evaluation answers into the shared Issue format
 * so they can be rendered by the shared IssueTable component.
 *
 * Issue shape:
 *   { type, category, location, description, severity, notes, evaluator, score }
 */

/**
 * Compute severity from a heuristic score relative to the max possible.
 * Gap = how far below the midpoint the score is.
 */
function computeSeverity(score, maxScore) {
  if (score == null) return null
  const threshold = maxScore / 2
  if (score >= threshold) return 'pass'
  const gap = threshold - score
  const range = threshold // max possible gap
  const ratio = gap / range
  if (ratio <= 0.25) return 'low'
  if (ratio <= 0.5) return 'medium'
  if (ratio <= 0.75) return 'high'
  return 'critical'
}

/**
 * Convert a heuristic answer document + test structure into a flat issues array.
 *
 * @param {Object} answerDoc - The testAnswerDocument from the store
 * @param {Object} test - The test object with testStructure
 * @returns {Array} Array of Issue objects
 */
export function toIssues(answerDoc, test) {
  const issues = []
  if (!answerDoc?.heuristicAnswers || !test?.testStructure) return issues

  const maxScore = test.testOptions?.answersScaleValue || 5

  Object.entries(answerDoc.heuristicAnswers).forEach(([userId, answer]) => {
    if (!answer?.heuristicQuestions) return

    answer.heuristicQuestions.forEach((hq, hIndex) => {
      const heuristic = test.testStructure[hIndex]
      if (!heuristic || !hq?.heuristicQuestions) return

      Object.entries(hq.heuristicQuestions).forEach(([qKey, q]) => {
        const score = q?.heuristicAnswer?.value
        const severity = computeSeverity(score, maxScore)

        // Only include items below the passing threshold
        if (severity && severity !== 'pass') {
          const qIndex = parseInt(qKey, 10)
          const question = heuristic.questions?.[qIndex]
          issues.push({
            type: 'heuristic',
            category: heuristic.title || `Heuristic ${hIndex + 1}`,
            location: `H${hIndex + 1} Q${qIndex + 1}`,
            description: question?.title || `Question ${qIndex + 1}`,
            severity,
            notes: q.heuristicComment || '',
            evaluator: answer.userDocId || userId,
            score,
            maxScore,
          })
        }
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
