/**
 * Krippendorff's Alpha — Inter-Rater Reliability
 *
 * Calculates the reliability coefficient for evaluator agreement.
 * Handles missing data gracefully (evaluators can skip questions).
 *
 * Formula: α = 1 − (Do / De)
 *   Do = observed disagreement
 *   De = expected disagreement by chance
 *
 * @param {Array<Array<number|null>>} dataMatrix
 *   Rows = evaluators, Columns = items (questions/steps)
 *   null = missing data (evaluator skipped this item)
 * @param {string} level - 'nominal' | 'ordinal' | 'interval'
 * @returns {{ alpha: number, interpretation: string, pairedCount: number }}
 */
export function calculateKrippendorffAlpha(dataMatrix, level = 'ordinal') {
  if (!dataMatrix || dataMatrix.length < 2) {
    return { alpha: null, interpretation: 'Insufficient data', pairedCount: 0 }
  }

  const evaluators = dataMatrix.length
  const items = dataMatrix[0]?.length || 0
  if (items === 0) {
    return { alpha: null, interpretation: 'No items to compare', pairedCount: 0 }
  }

  const columns = []
  for (let j = 0; j < items; j++) {
    const col = []
    for (let i = 0; i < evaluators; i++) {
      const val = dataMatrix[i]?.[j]
      if (val !== null && val !== undefined) col.push(val)
    }
    columns.push(col)
  }

  const allValues = columns.flat()
  if (allValues.length === 0) {
    return { alpha: null, interpretation: 'No data', pairedCount: 0 }
  }
  const uniqueValues = [...new Set(allValues)].sort((a, b) => a - b)

  const diffFn = getDifferenceFunction(level, uniqueValues)

  let observedDisagreement = 0
  let totalPairs = 0

  for (let j = 0; j < items; j++) {
    const vals = columns[j]
    const n = vals.length
    if (n < 2) continue
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        observedDisagreement += diffFn(vals[a], vals[b])
        totalPairs++
      }
    }
  }

  if (totalPairs === 0) {
    return { alpha: null, interpretation: 'No overlapping ratings', pairedCount: 0 }
  }

  const Do = observedDisagreement / totalPairs
  const N = allValues.length
  let expectedDisagreement = 0
  let expectedPairs = 0

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      expectedDisagreement += diffFn(allValues[a], allValues[b])
      expectedPairs++
    }
  }

  if (expectedPairs === 0) {
    return { alpha: null, interpretation: 'Cannot compute expected disagreement', pairedCount: totalPairs }
  }

  const De = expectedDisagreement / expectedPairs
  const alpha = De === 0 ? 1 : 1 - (Do / De)
  const clamped = Math.max(-1, Math.min(1, alpha))

  return {
    alpha: parseFloat(clamped.toFixed(4)),
    interpretation: getInterpretation(clamped),
    pairedCount: totalPairs,
  }
}

function getDifferenceFunction(level, uniqueValues) {
  switch (level) {
    case 'nominal':
      return (a, b) => a === b ? 0 : 1
    case 'ordinal': {
      const rankMap = {}
      uniqueValues.forEach((v, i) => { rankMap[v] = i })
      const maxRank = uniqueValues.length - 1
      if (maxRank === 0) return () => 0
      return (a, b) => {
        const diff = (rankMap[a] - rankMap[b]) / maxRank
        return diff * diff
      }
    }
    case 'interval':
    default:
      return (a, b) => (a - b) * (a - b)
  }
}

function getInterpretation(alpha) {
  if (alpha >= 0.80) return 'High reliability — strong evaluator consensus'
  if (alpha >= 0.67) return 'Acceptable reliability — moderate consensus'
  if (alpha >= 0.40) return 'Low reliability — evaluators disagree significantly'
  return 'Very low reliability — findings may reflect evaluator bias'
}

/**
 * Build data matrix from HE answers.
 * Rows = evaluators, Columns = all questions (flattened).
 */
export function buildHEDataMatrix(answerDoc) {
  if (!answerDoc?.heuristicAnswers) return []

  const evaluators = Object.values(answerDoc.heuristicAnswers)
  if (evaluators.length < 2) return []

  let totalItems = 0
  evaluators.forEach((ev) => {
    if (!ev?.heuristicQuestions) return
    let count = 0
    ev.heuristicQuestions.forEach((hq) => {
      if (hq?.heuristicQuestions) {
        count += Object.keys(hq.heuristicQuestions).length
      }
    })
    if (count > totalItems) totalItems = count
  })

  if (totalItems === 0) return []

  return evaluators.map((ev) => {
    const row = []
    if (!ev?.heuristicQuestions) return new Array(totalItems).fill(null)
    ev.heuristicQuestions.forEach((hq) => {
      if (!hq?.heuristicQuestions) return
      const sorted = Object.keys(hq.heuristicQuestions).sort((a, b) => parseInt(a) - parseInt(b))
      sorted.forEach((qKey) => {
        const val = hq.heuristicQuestions[qKey]?.heuristicAnswer?.value
        row.push(val != null && !isNaN(val) ? val : null)
      })
    })
    while (row.length < totalItems) row.push(null)
    return row
  })
}

/**
 * Build data matrix from CW answers.
 * Real CW data format: answerDoc.cwAnswers[userId].answers["tIdx-sIdx"] = { q1Pass, q2Pass, q3Pass, q4Pass }
 * Rows = evaluators, Columns = step questions (4 per step, flattened).
 * Values: 1 = pass, 0 = fail, null = missing.
 */
export function buildCWDataMatrix(answerDoc) {
  if (!answerDoc?.cwAnswers) return []

  const evalEntries = Object.values(answerDoc.cwAnswers)
  if (evalEntries.length < 2) return []

  // Discover all step keys across all evaluators
  const allStepKeys = new Set()
  evalEntries.forEach((ev) => {
    if (!ev?.answers) return
    Object.keys(ev.answers).forEach((k) => allStepKeys.add(k))
  })

  const sortedKeys = [...allStepKeys].sort((a, b) => {
    const [at, as] = a.split('-').map(Number)
    const [bt, bs] = b.split('-').map(Number)
    return at !== bt ? at - bt : as - bs
  })

  if (sortedKeys.length === 0) return []

  const qKeys = ['q1Pass', 'q2Pass', 'q3Pass', 'q4Pass']

  return evalEntries.map((ev) => {
    const row = []
    sortedKeys.forEach((stepKey) => {
      const a = ev?.answers?.[stepKey]
      qKeys.forEach((qk) => {
        if (!a || a[qk] === null || a[qk] === undefined) {
          row.push(null)
        } else {
          row.push(a[qk] ? 1 : 0)
        }
      })
    })
    return row
  })
}
