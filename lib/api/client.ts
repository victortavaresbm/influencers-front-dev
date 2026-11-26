// Gateway client: pure functions, so they run under `node --test` without Next.
// Every call carries the Clerk session token (aud = the gateway) and, on
// Marca-scoped routes, the active Marca. The gateway answers errors as
// problem+json; callers branch on ApiError.code.

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  // The problem+json body, when there was one: detail and extension members
  // such as price/balance of insufficient_coins.
  readonly problem?: Record<string, unknown>

  constructor(status: number, code: string, message?: string, problem?: Record<string, unknown>) {
    super(message ?? code)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.problem = problem
  }
}

export interface ApiContext {
  baseUrl: string
  token: string | null
  marcaId: string | null
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The marca and creator classes act inside one Marca. me, public and admin do
// not: admin/* is global and the gateway ignores X-Marca-Id there.
const MARCA_SCOPED = /^\/v1\/[a-z-]+\/(marca|creator)(\/|$)/

export function isMarcaId(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID.test(value)
}

export function buildRequest(ctx: ApiContext, method: HttpMethod, path: string, body?: unknown) {
  if (!ctx.baseUrl) throw new ApiError(0, "api_not_configured")
  if (!ctx.token) throw new ApiError(0, "not_signed_in")
  const headers: Record<string, string> = {
    Accept: "application/json, application/problem+json",
    Authorization: `Bearer ${ctx.token}`,
  }
  if (MARCA_SCOPED.test(path)) {
    if (!isMarcaId(ctx.marcaId)) throw new ApiError(0, "brand_required")
    headers["X-Marca-Id"] = ctx.marcaId.toLowerCase()
  }
  const init: RequestInit = { method, headers }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
    init.body = JSON.stringify(body)
  }
  return { url: ctx.baseUrl.replace(/\/+$/, "") + path, init }
}

export async function parseError(res: Response): Promise<ApiError> {
  try {
    const problem = (await res.json()) as { code?: unknown; title?: unknown }
    if (typeof problem.code === "string" && problem.code) {
      return new ApiError(res.status, problem.code, typeof problem.title === "string" ? problem.title : undefined, problem as Record<string, unknown>)
    }
  } catch {
    // Not JSON: a proxy page or an empty body.
  }
  return new ApiError(res.status, `http_${res.status}`)
}

export async function apiFetch<T>(
  ctx: ApiContext,
  method: HttpMethod,
  path: string,
  body?: unknown,
  fetchImpl: typeof fetch = fetch
): Promise<T> {
  const { url, init } = buildRequest(ctx, method, path, body)
  let res: Response
  try {
    res = await fetchImpl(url, init)
  } catch {
    throw new ApiError(0, "network_error")
  }
  if (!res.ok) throw await parseError(res)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}
