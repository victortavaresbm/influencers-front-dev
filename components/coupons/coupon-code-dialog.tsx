"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { updateCouponCode, type BrandCouponRow, type CouponCodeView } from "@/lib/api/coupons"
import { apiErrorCode } from "@/lib/api/errors"
import { useApi } from "@/lib/api/use-api"
import { validateCouponCode } from "@/lib/coupons/coupons"
import { useI18n } from "@/lib/i18n"
import { couponErrorText } from "./coupon-ui"

// Errors that mean the row on screen is out of date.
const STALE = new Set(["coupon_not_found", "coupon_not_editable"])

export function CouponCodeDialog({
  coupon,
  onClose,
  onSaved,
  onStale,
}: {
  coupon: BrandCouponRow | null
  onClose: () => void
  onSaved: (view: CouponCodeView) => void
  onStale: () => void
}) {
  const { t } = useI18n()
  return (
    <Dialog open={coupon !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("coupons.code.title")}</DialogTitle>
          <DialogDescription>{t("coupons.code.help")}</DialogDescription>
        </DialogHeader>
        {coupon && <CodeForm key={coupon.id} coupon={coupon} onClose={onClose} onSaved={onSaved} onStale={onStale} />}
      </DialogContent>
    </Dialog>
  )
}

function CodeForm({
  coupon,
  onClose,
  onSaved,
  onStale,
}: {
  coupon: BrandCouponRow
  onClose: () => void
  onSaved: (view: CouponCodeView) => void
  onStale: () => void
}) {
  const { t } = useI18n()
  const { request } = useApi()
  const [typed, setTyped] = useState(coupon.code)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const check = validateCouponCode(typed)
    if (!check.ok) {
      setError(t(check.errorKey))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const view = await updateCouponCode(request, coupon.id, check.code)
      onSaved(view)
      toast.add({ type: "success", title: t("coupons.code.saved"), description: view.code })
      onClose()
    } catch (err) {
      setError(couponErrorText(t, err))
      if (STALE.has(apiErrorCode(err))) onStale()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <div className="space-y-1.5">
        <Input
          autoFocus
          autoComplete="off"
          maxLength={25}
          aria-label={t("coupons.codeLabel")}
          aria-invalid={error !== null}
          className="font-mono uppercase"
          value={typed}
          onChange={(event) => {
            setTyped(event.target.value)
            setError(null)
          }}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("coupons.code.cancel")}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t("coupons.code.saving") : t("coupons.code.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
