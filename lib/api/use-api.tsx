"use client"
import { createContext, useCallback, useContext, useMemo } from "react"
import { apiFetch, type HttpMethod } from "@/lib/api/client"
import { useMarcaStore } from "@/lib/api/marca"

export interface ApiAuth {
  // true only with a real (Clerk) session; demo logins have no token.
  signedIn: boolean
  getToken: () => Promise<string | null>
}

const ApiAuthContext = createContext<ApiAuth>({ signedIn: false, getToken: async () => null })

export const ApiAuthProvider = ApiAuthContext.Provider

export function useApi() {
  const auth = useContext(ApiAuthContext)
  const marcaId = useMarcaStore((state) => state.marcaId)
  const request = useCallback(
    async <T,>(method: HttpMethod, path: string, body?: unknown) =>
      apiFetch<T>(
        { baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "", token: await auth.getToken(), marcaId },
        method,
        path,
        body
      ),
    [auth, marcaId]
  )
  return useMemo(
    () => ({ signedIn: auth.signedIn, marcaId, request, getToken: auth.getToken }),
    [auth.signedIn, marcaId, request, auth.getToken]
  )
}
