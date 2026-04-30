/**
 * Lightweight in-memory cache for /api/applications/
 * Prevents duplicate fetches when navigating between dashboard and applications page.
 * TTL: 30 seconds — data is considered fresh for this window.
 */

type Application = {
  id: number
  university: string
  program: string
  status: string
  deadline: string | null
  applied_date: string | null
  professors: string[]
  research_interest: string | null
  notes: string | null
  created_at: string
}

const TTL_MS = 30_000

let cache: Application[] | null = null
let cacheTime = 0
let inflight: Promise<Application[]> | null = null

/** Return cached data if fresh, otherwise fetch and cache. */
export async function fetchApplicationsCached(
  fetcher: () => Promise<Application[]>,
): Promise<Application[]> {
  const now = Date.now()

  // Return from cache if still fresh
  if (cache !== null && now - cacheTime < TTL_MS) {
    return cache
  }

  // Deduplicate concurrent calls — return the same promise if one is in flight
  if (inflight) return inflight

  inflight = fetcher().then((data) => {
    cache = data
    cacheTime = Date.now()
    inflight = null
    return data
  }).catch((err) => {
    inflight = null
    throw err
  })

  return inflight
}

/** Call this after any mutation so the next fetch gets fresh data. */
export function invalidateApplicationsCache() {
  cache = null
  cacheTime = 0
}
