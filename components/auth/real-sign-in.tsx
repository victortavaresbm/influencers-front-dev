"use client"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

// Rendered only when Clerk is configured: SignInButton needs ClerkProvider.
export function RealSignIn() {
  const { t } = useI18n()
  return (
    <div className="mb-8 space-y-3">
      <SignInButton mode="modal">
        <Button type="button" className="w-full">
          {t("login.realAccount")}
        </Button>
      </SignInButton>
      <p className="text-xs text-zinc-500">{t("login.realAccountHelp")}</p>
      <p className="pt-2 text-center text-xs uppercase tracking-wide text-zinc-400">{t("login.or")}</p>
    </div>
  )
}
