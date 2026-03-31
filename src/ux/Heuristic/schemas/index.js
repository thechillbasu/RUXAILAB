import nielsen10 from '@/ux/Heuristic/schemas/nielsen10.json'
import bertini8Mobile from '@/ux/Heuristic/schemas/bertini8Mobile.json'
import wcag21 from '@/ux/Heuristic/schemas/wcag21.json'

/**
 * All available heuristic schemas.
 * Adding a new schema: create the JSON in src/ux/Heuristic/schemas/, import it, and add to this array.
 */
export const heuristicSchemas = [nielsen10, bertini8Mobile, wcag21]

/**
 * Get a schema by its ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getSchemaById(id) {
  return heuristicSchemas.find((s) => s.id === id) || null
}

/**
 * Get schema options for a dropdown.
 * @returns {Array<{ value: string, title: string, subtitle: string }>}
 */
export function getSchemaOptions() {
  return heuristicSchemas.map((s) => ({
    value: s.id,
    title: s.name,
    subtitle: `${s.author} (${s.year}) — ${s.heuristics.length} heuristics`,
  }))
}
