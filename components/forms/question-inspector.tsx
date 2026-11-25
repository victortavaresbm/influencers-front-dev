"use client"

import { Trash2 } from "lucide-react"
import { QuestionTypeOption } from "@/components/forms/form-builder"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  QUESTION_TYPES,
  isChoiceType,
  type FormQuestion,
  type MatchWeight,
  type QuestionType,
} from "@/lib/mock-data/forms"
import { useI18n } from "@/lib/i18n"

// Inspector for a single question, driven from a field block in the Construtor.
// form.questions is the source of truth; this edits one entry.
export function QuestionInspector({
  question,
  index,
  onChange,
  onDelete,
}: {
  question: FormQuestion
  index: number
  onChange: (patch: Partial<FormQuestion>) => void
  onDelete: () => void
}) {
  const { t } = useI18n()

  const changeType = (type: QuestionType) => {
    onChange({
      type,
      options: isChoiceType(type) ? (question.options?.length ? question.options : ["", ""]) : undefined,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-900">
          {t("forms.editQuestion")} {index + 1}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 />
          {t("forms.deleteQuestion")}
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>{t("forms.questionType")}</Label>
        <Select value={question.type} onValueChange={(value) => value && changeType(value as QuestionType)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value) => (value ? <QuestionTypeOption type={value as QuestionType} /> : null)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                <QuestionTypeOption type={type} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="q-title">{t("forms.questionTitle")}</Label>
        <Input id="q-title" value={question.title} onChange={(event) => onChange({ title: event.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="q-help">{t("forms.questionHelp")}</Label>
        <Input id="q-help" value={question.help ?? ""} onChange={(event) => onChange({ help: event.target.value })} />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <Checkbox checked={question.required} onCheckedChange={(checked) => onChange({ required: checked === true })} />
        {t("forms.required")}
      </label>

      {isChoiceType(question.type) && (
        <div className="space-y-2">
          <Label>{t("forms.options")}</Label>
          {(question.options ?? []).map((option, optionIndex) => (
            <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
              <Input
                value={option}
                placeholder={t("forms.optionPlaceholder")}
                onChange={(event) => {
                  const options = [...(question.options ?? [])]
                  options[optionIndex] = event.target.value
                  onChange({ options })
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("forms.removeOption")}
                onClick={() => onChange({ options: (question.options ?? []).filter((_, i) => i !== optionIndex) })}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ options: [...(question.options ?? []), ""] })}
          >
            {t("forms.addOption")}
          </Button>
        </div>
      )}

      <div className="space-y-1.5 border-t border-zinc-100 pt-3">
        <Label>{t("forms.matchWeight")}</Label>
        <Select
          value={String(question.match?.weight ?? 0)}
          onValueChange={(value) => {
            if (value == null) return
            const weight = Number(value) as MatchWeight
            onChange({ match: weight === 0 ? undefined : { weight, ideal: question.match?.ideal } })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value) =>
                value === "3"
                  ? t("forms.matchHigh")
                  : value === "2"
                    ? t("forms.matchMid")
                    : value === "1"
                      ? t("forms.matchLow")
                      : t("forms.matchNone")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t("forms.matchNone")}</SelectItem>
            <SelectItem value="1">{t("forms.matchLow")}</SelectItem>
            <SelectItem value="2">{t("forms.matchMid")}</SelectItem>
            <SelectItem value="3">{t("forms.matchHigh")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(question.match?.weight ?? 0) > 0 && (
        <MatchIdeal
          question={question}
          onChange={(ideal) => onChange({ match: { weight: question.match?.weight ?? 1, ideal } })}
        />
      )}
    </div>
  )
}

function MatchIdeal({ question, onChange }: { question: FormQuestion; onChange: (ideal: string[]) => void }) {
  const { t } = useI18n()
  const ideal = question.match?.ideal ?? []
  if (question.type === "yes_no") {
    return (
      <div className="space-y-2">
        <Label>{t("forms.matchIdeal")}</Label>
        {(["yes", "no"] as const).map((value) => (
          <label key={value} className="flex items-center gap-2 text-sm text-zinc-700">
            <Checkbox
              checked={ideal.includes(value)}
              onCheckedChange={(checked) =>
                onChange(checked === true ? [...ideal, value] : ideal.filter((item) => item !== value))
              }
            />
            {value === "yes" ? t("forms.yes") : t("forms.no")}
          </label>
        ))}
      </div>
    )
  }
  if (isChoiceType(question.type)) {
    return (
      <div className="space-y-2">
        <Label>{t("forms.matchIdeal")}</Label>
        <p className="text-xs text-zinc-400">{t("forms.matchIdealHelp")}</p>
        {(question.options ?? [])
          .filter((option) => option.trim())
          .map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={ideal.includes(option)}
                onCheckedChange={(checked) =>
                  onChange(checked === true ? [...ideal, option] : ideal.filter((item) => item !== option))
                }
              />
              {option}
            </label>
          ))}
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      <Label htmlFor="match-ideal">{t("forms.matchIdealText")}</Label>
      <Input
        id="match-ideal"
        value={ideal.join(", ")}
        placeholder={t("forms.matchIdealTextHelp")}
        onChange={(event) => onChange(event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
      />
    </div>
  )
}
