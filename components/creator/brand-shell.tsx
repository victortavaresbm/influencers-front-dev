"use client"

import { createContext, useContext } from "react"
import { usePathname, useRouter } from "next/navigation"
import UseAnimations, { type Animation } from "react-useanimations"
import messageCircle from "react-useanimations/lib/messageCircle"
import bookOpen from "react-useanimations/lib/bookOpen"
import link2 from "react-useanimations/lib/link2"
import award from "react-useanimations/lib/award"
import image from "react-useanimations/lib/image"
import target from "react-useanimations/lib/target"
import notification from "react-useanimations/lib/notification"
import users from "react-useanimations/lib/users"
import { CreditBalance } from "@/components/credits/credit-balance"
import { PartnerCommunitySwitcher } from "@/components/community/partner-community-switcher"
import { useAuthStore } from "@/lib/stores/auth"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n, type MessageKey } from "@/lib/i18n"

const BrandSearchContext = createContext("")

export function useBrandSearch() {
  return useContext(BrandSearchContext)
}

const CREATOR_TABS: { href: string; labelKey: MessageKey; animation: Animation }[] = [
  { href: "/creator/community", labelKey: "nav.community", animation: messageCircle },
  { href: "/creator/participants", labelKey: "nav.participants", animation: users },
  { href: "/creator/content", labelKey: "nav.content", animation: bookOpen },
  { href: "/creator/links", labelKey: "nav.links", animation: link2 },
  { href: "/creator/ranking", labelKey: "nav.ranking", animation: award },
  { href: "/creator/materials", labelKey: "nav.materials", animation: image },
  { href: "/creator/partner/campaigns", labelKey: "nav.myCampaigns", animation: target },
]

const MANAGE_TABS: { href: string; labelKey: MessageKey; animation: Animation }[] = [
  { href: "/community", labelKey: "nav.community", animation: messageCircle },
  { href: "/participants", labelKey: "nav.participants", animation: users },
  { href: "/push", labelKey: "nav.push", animation: notification },
  { href: "/content", labelKey: "nav.content", animation: bookOpen },
  { href: "/links", labelKey: "nav.links", animation: link2 },
  { href: "/ranking", labelKey: "nav.ranking", animation: award },
  { href: "/materials", labelKey: "nav.materials", animation: image },
  { href: "/partner/campaigns", labelKey: "nav.myCampaigns", animation: target },
]

export function BrandShell({ children, manage = false }: { children: React.ReactNode; manage?: boolean }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const tabs = manage ? MANAGE_TABS : CREATOR_TABS
  const active = tabs.find((tab) => pathname === tab.href || pathname.startsWith(tab.href + "/"))?.href ?? tabs[0].href
  const ownLogo = user?.orgLogo ?? (user?.organizationId ? ORG_LOGOS[user.organizationId]?.logo : undefined)

  return (
    <BrandSearchContext.Provider value="">
      <div className="flex min-h-screen min-w-0 flex-1 flex-col items-center bg-zinc-50">
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-3">
            {manage ? (
              <div className="flex min-w-0 items-center gap-2">
                {ownLogo ? (
                  <img src={ownLogo} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {(user?.organizationName ?? "WS").slice(0, 2)}
                  </span>
                )}
                <span className="truncate text-base font-semibold text-foreground">{user?.organizationName}</span>
              </div>
            ) : (
              <PartnerCommunitySwitcher variant="header" />
            )}
            {manage && (
              <div className="ml-auto shrink-0">
                <CreditBalance />
              </div>
            )}
          </div>
          <Tabs
            value={active}
            onValueChange={(value) => {
              if (typeof value === "string") router.push(value)
            }}
            className="gap-0"
          >
            <TabsList variant="line" className="mx-auto h-auto w-full max-w-6xl justify-start gap-1 rounded-none bg-transparent px-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.href} value={tab.href} className="flex-none px-3 py-2.5">
                  <UseAnimations animation={tab.animation} size={16} />
                  {t(tab.labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>
        <div className="flex w-full min-w-0 max-w-6xl flex-1 flex-col">{children}</div>
      </div>
    </BrandSearchContext.Provider>
  )
}
