/**
 * Fuzzy Deduplication Utility
 *
 * Groups similar issues using Jaro-Winkler string similarity.
 * Used client-side to visually cluster potential duplicate issues
 * without deleting data.
 */

/**
 * Jaro-Winkler similarity between two strings.
 * Returns a value between 0 (no similarity) and 1 (identical).
 *
 * @param {string} s1
 * @param {string} s2
 * @returns {number}
 */
export function jaroWinkler(s1, s2) {
  if (!s1 || !s2) return 0
  s1 = s1.toLowerCase().trim()
  s2 = s2.toLowerCase().trim()
  if (s1 === s2) return 1

  const len1 = s1.length
  const len2 = s2.length
  if (len1 === 0 || len2 === 0) return 0

  const matchWindow = Math.max(0, Math.floor(Math.max(len1, len2) / 2) - 1)

  const s1Matches = new Array(len1).fill(false)
  const s2Matches = new Array(len2).fill(false)

  let matches = 0
  let transpositions = 0

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, len2)

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = true
      s2Matches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0

  // Count transpositions
  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3

  // Winkler bonus for common prefix (up to 4 chars)
  let prefix = 0
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++
    else break
  }

  return jaro + prefix * 0.1 * (1 - jaro)
}

/**
 * Jaccard token similarity for longer text.
 * Splits by words, removes stop words, computes set intersection / union.
 *
 * @param {string} s1
 * @param {string} s2
 * @returns {number} 0-1 similarity
 */
export function jaccardSimilarity(s1, s2) {
  if (!s1 || !s2) return 0

  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'to', 'of', 'in', 'for', 'on', 'with',
    'at', 'by', 'from', 'it', 'this', 'that', 'not', 'and', 'or',
    'but', 'if', 'so', 'as', 'than', 'too', 'very', 'just',
  ])

  const tokenize = (s) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w))

  const tokens1 = new Set(tokenize(s1))
  const tokens2 = new Set(tokenize(s2))

  if (tokens1.size === 0 || tokens2.size === 0) return 0

  let intersection = 0
  tokens1.forEach((t) => { if (tokens2.has(t)) intersection++ })

  const union = tokens1.size + tokens2.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Combined similarity score.
 *
 * For CW issues at the same location (same task + step), they are the
 * same usability problem reported by different evaluators → always group.
 * For other issues, uses weighted title/notes similarity.
 *
 * @param {Object} issueA
 * @param {Object} issueB
 * @returns {number} 0-1 combined score
 */
export function issueSimilarity(issueA, issueB) {
  // CW issues: same location = same problem, always group
  if (
    issueA.type === 'cognitive_walkthrough' &&
    issueB.type === 'cognitive_walkthrough' &&
    issueA.location &&
    issueA.location === issueB.location
  ) {
    return 1.0
  }

  // For HE / other issues: use fuzzy matching on category + description
  const titleSim = jaroWinkler(
    `${issueA.category} ${issueA.description}`,
    `${issueB.category} ${issueB.description}`,
  )
  const notesSim = jaccardSimilarity(issueA.notes || '', issueB.notes || '')

  // Weight: 80% title, 20% notes (notes shouldn't prevent grouping)
  return titleSim * 0.8 + notesSim * 0.2
}

/**
 * Group issues by similarity. Issues with combined similarity ≥ threshold
 * are placed in the same group.
 *
 * @param {Array} issues
 * @param {number} threshold - default 0.80
 * @returns {Array<{ primary: Object, duplicates: Array, groupId: number }>}
 */
export function groupDuplicates(issues, threshold = 0.80) {
  if (!issues || issues.length === 0) return []

  const assigned = new Set()
  const groups = []
  let groupId = 0

  for (let i = 0; i < issues.length; i++) {
    if (assigned.has(i)) continue

    const group = { primary: issues[i], duplicates: [], groupId: groupId++ }
    assigned.add(i)

    for (let j = i + 1; j < issues.length; j++) {
      if (assigned.has(j)) continue

      const sim = issueSimilarity(issues[i], issues[j])
      if (sim >= threshold) {
        group.duplicates.push({ ...issues[j], similarity: parseFloat(sim.toFixed(2)) })
        assigned.add(j)
      }
    }

    groups.push(group)
  }

  return groups
}
