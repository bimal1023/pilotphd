export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 60000
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const token = typeof window !== "undefined" ? localStorage.getItem("pilotphd_token") : null

  const headers = new Headers(options.headers as HeadersInit | undefined)
  if (token) headers.set("Authorization", `Bearer ${token}`)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers,
    })
    clearTimeout(timeout)
    return res
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Claude is taking too long — please try again.")
    }
    throw new Error("Network error. Please check your connection and try again.")
  }
}
