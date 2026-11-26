"use client"
import { ApiError } from "@/lib/api/client"
import type { MessageKey } from "@/lib/i18n"

const KNOWN: Record<string, MessageKey> = {
  module_disabled: "api.error.moduleDisabled",
  brand_access_denied: "api.error.brandAccessDenied",
  brand_required: "api.error.brandRequired",
  not_signed_in: "api.error.notSignedIn",
  api_not_configured: "api.error.apiNotConfigured",
  network_error: "api.error.network",
  authorization_unavailable: "api.error.authorizationUnavailable",
  token_invalid: "api.error.notSignedIn",
  hotmart_credentials_rejected: "api.error.hotmartCredentialsRejected",
  store_already_connected: "api.error.storeAlreadyConnected",
  hotmart_unavailable: "api.error.hotmartUnavailable",
}

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

export function apiErrorCode(err: unknown) {
  return err instanceof ApiError ? err.code : "unknown"
}

export function apiErrorMessage(t: Translate, err: unknown) {
  const code = apiErrorCode(err)
  const key = KNOWN[code]
  return key ? t(key) : t("api.error.generic", { code })
}
