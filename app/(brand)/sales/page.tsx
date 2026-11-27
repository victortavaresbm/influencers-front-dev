"use client"

import { TopBar } from "@/components/layout/top-bar"
import { SalesTable } from "@/components/sales/sales-table"
import { useI18n } from "@/lib/i18n"

export default function SalesPage() {
  const { t } = useI18n()
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("nav.sales")} subtitle={t("sales.subtitle")} />
      <div className="w-full p-6">
        <SalesTable />
      </div>
    </div>
  )
}
