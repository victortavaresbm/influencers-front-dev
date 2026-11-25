"use client"

import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  SOCIAL_LABEL,
  SOCIAL_NETWORKS,
  SOCIAL_PLACEHOLDER,
  invalidSocialFields,
  readSocialDraft,
  writeSocialDraft,
} from "@/lib/forms/social-links"
import type { AnswerValue } from "@/lib/mock-data/forms"
import type { Network } from "@/lib/mock-data/creators"
import { useI18n } from "@/lib/i18n"

const ICON = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
} as const

export function SocialLinksField({
  idPrefix,
  value,
  showInvalid,
  onChange,
}: {
  idPrefix: string
  value: AnswerValue | undefined
  showInvalid: boolean
  onChange: (value: AnswerValue) => void
}) {
  const { t } = useI18n()
  const draft = readSocialDraft(value)
  const invalid = new Set(showInvalid ? invalidSocialFields(value) : [])

  const change = (network: Network, next: string) => {
    onChange(writeSocialDraft({ ...draft, [network]: next }))
  }

  return (
    <div className="space-y-3">
      {SOCIAL_NETWORKS.map((network) => {
        const Icon = ICON[network]
        const fieldId = `${idPrefix}-${network}`
        const bad = invalid.has(network)
        return (
          <div key={network} className="space-y-1.5">
            <Label htmlFor={fieldId}>{SOCIAL_LABEL[network]}</Label>
            <InputGroup>
              <InputGroupAddon>
                <Icon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id={fieldId}
                type="url"
                inputMode="url"
                placeholder={SOCIAL_PLACEHOLDER[network]}
                value={draft[network]}
                aria-invalid={bad}
                onChange={(event) => change(network, event.target.value)}
              />
            </InputGroup>
            {bad ? <p className="text-sm text-red-600">{t("forms.socialInvalid")}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
