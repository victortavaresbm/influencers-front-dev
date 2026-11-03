"use client"

import { CreditBalance } from "@/components/credits/credit-balance"
import { NotificationsButton } from "@/components/layout/notifications-button"
import { SuggestionsButton } from "@/components/layout/suggestions-button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/stores/auth"

export function HeaderUtilities({ credits = true }: { credits?: boolean }) {
  const showCredits = useAuthStore(
    (state) => credits && state.user?.role === "brand" && Boolean(state.user.organizationId)
  )

  return (
    <div className="flex items-center gap-1">
      {showCredits && (
        <>
          <CreditBalance />
          <Separator orientation="vertical" className="mx-1.5" />
        </>
      )}
      <SuggestionsButton />
      <NotificationsButton />
    </div>
  )
}
