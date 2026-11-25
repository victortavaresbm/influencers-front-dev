"use client"

import { useState } from "react"
import {
  AlignLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Hash,
  Link,
  ListChecks,
  Mail,
  Phone,
  ToggleLeft,
  Trash2,
  Type,
  Video,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormRunner } from "@/components/forms/form-runner"
import {
  QUESTION_TYPES,
  createQuestion,
  isChoiceType,
  type ApplicationForm,
  type FormQuestion,
  type MatchWeight,
  type QuestionType,
} from "@/lib/mock-data/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export const TYPE_KEY: Record<QuestionType, MessageKey> = {
  short_text: "forms.type.shortText",
  long_text: "forms.type.longText",
  single_choice: "forms.type.singleChoice",
  multiple_choice: "forms.type.multipleChoice",
  yes_no: "forms.type.yesNo",
  number: "forms.type.number",
  link: "forms.type.link",
  email: "forms.type.email",
  phone: "forms.type.phone",
  date: "forms.type.date",
  video_response: "forms.type.videoResponse",
}

export const TYPE_ICON: Record<QuestionType, LucideIcon> = {
  short_text: Type,
  long_text: AlignLeft,
  single_choice: CircleDot,
  multiple_choice: ListChecks,
  yes_no: ToggleLeft,
  number: Hash,
  link: Link,
  email: Mail,
  phone: Phone,
  date: Calendar,
  video_response: Video,
}

export function QuestionTypeOption({ type }: { type: QuestionType }) {
  const { t } = useI18n()
  const Icon = TYPE_ICON[type]
  return (
    <>
      <Icon className="text-muted-foreground" />
      {t(TYPE_KEY[type])}
    </>
  )
}

export function FormBuilder({
  form,
  campaigns,
  onChange,
  conflictNote,
  hideScope = false,
}: {
  form: ApplicationForm
  campaigns: { id: string; name: string }[]
  onChange: (next: ApplicationForm) => void
  conflictNote?: string
  hideScope?: boolean
}) {
  const { t } = useI18n()
  const [selectedId, setSelectedId] = useState(form.questions[0]?.id ?? "")
  const [addKey, setAddKey] = useState(0)
  const selected = form.questions.find((question) => question.id === selectedId) ?? form.questions[0]

  const patch = (next: Partial<ApplicationForm>) => onChange({ ...form, ...next })

  const updateQuestion = (id: string, next: Partial<FormQuestion>) => {
    patch({
      questions: form.questions.map((question) => (question.id === id ? { ...question, ...next } : question)),
    })
  }

  const addQuestion = (type: QuestionType) => {
    const question = createQuestion(type)
    patch({ questions: [...form.questions, question] })
    setSelectedId(question.id)
  }

  const moveQuestion = (id: string, direction: -1 | 1) => {
    const index = form.questions.findIndex((question) => question.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= form.questions.length) return
    const questions = [...form.questions]
    const [item] = questions.splice(index, 1)
    questions.splice(target, 0, item)
    patch({ questions })
  }

  const removeQuestion = (id: string) => {
    const questions = form.questions.filter((question) => question.id !== id)
    patch({ questions })
    if (selectedId === id) setSelectedId(questions[0]?.id ?? "")
  }

  const changeType = (type: QuestionType) => {
    if (!selected) return
    updateQuestion(selected.id, {
      type,
      options: isChoiceType(type) ? (selected.options?.length ? selected.options : ["", ""]) : undefined,
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[288px_minmax(0,1fr)_320px]">
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3">
        <p className="px-1 text-xs font-medium text-zinc-500">{t("forms.questions")}</p>
        <div className="space-y-1">
          {form.questions.map((question, index) => (
            <div key={question.id} className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedId(question.id)}
                className={cn(
                  "h-auto min-w-0 flex-1 justify-start px-2 py-1.5 text-left",
                  selected?.id === question.id && "bg-zinc-100",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-900">
                    {index + 1}. {question.title || t("forms.untitledQuestion")}
                  </span>
                  <span className="block truncate text-xs font-normal text-zinc-400">{t(TYPE_KEY[question.type])}</span>
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("forms.moveUp")}
                disabled={index === 0}
                onClick={() => moveQuestion(question.id, -1)}
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("forms.moveDown")}
                disabled={index === form.questions.length - 1}
                onClick={() => moveQuestion(question.id, 1)}
              >
                <ChevronDown />
              </Button>
            </div>
          ))}
        </div>
        <Select
          key={addKey}
          onValueChange={(value) => {
            if (!value) return
            addQuestion(value as QuestionType)
            setAddKey((current) => current + 1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("forms.addQuestion")} />
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

      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
        {!hideScope && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("forms.scope")}</Label>
              <Select
                value={form.scope}
                onValueChange={(value) => {
                  if (value !== "brand" && value !== "campaign") return
                  patch({ scope: value, campaignId: value === "brand" ? undefined : form.campaignId })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value) => (value === "campaign" ? t("forms.scopeCampaign") : t("forms.scopeBrand"))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand">{t("forms.scopeBrand")}</SelectItem>
                  <SelectItem value="campaign">{t("forms.scopeCampaign")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.scope === "campaign" && (
              <div className="space-y-1.5">
                <Label>{t("forms.pickCampaign")}</Label>
                <Select
                  value={form.campaignId ?? ""}
                  onValueChange={(value) => patch({ campaignId: value || undefined })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("forms.noCampaign")}>
                      {(value) => campaigns.find((campaign) => campaign.id === value)?.name ?? t("forms.noCampaign")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="form-title">{t("forms.formTitle")}</Label>
          <Input
            id="form-title"
            value={form.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="form-description">{t("forms.description")}</Label>
          <Textarea
            id="form-description"
            value={form.description}
            rows={2}
            onChange={(event) => patch({ description: event.target.value })}
          />
        </div>
        {conflictNote ? <p className="text-sm text-amber-700">{conflictNote}</p> : null}

        <div className="space-y-1.5">
          <Label htmlFor="brand-summary">{t("forms.brandSummary")}</Label>
          <Textarea
            id="brand-summary"
            value={form.brandSummary ?? ""}
            rows={4}
            placeholder={t("forms.brandSummaryHelp")}
            onChange={(event) => patch({ brandSummary: event.target.value })}
          />
          <p className="text-xs text-zinc-400">{t("forms.briefCheckHelp")}</p>
        </div>

        {selected ? (
          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-900">{t("forms.editQuestion")}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(selected.id)}>
                <Trash2 />
                {t("forms.deleteQuestion")}
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>{t("forms.questionType")}</Label>
              <Select value={selected.type} onValueChange={(value) => value && changeType(value as QuestionType)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value) => (value ? <QuestionTypeOption type={value as QuestionType} /> : null)}
                  </SelectValue>
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
              <Label htmlFor="question-title">{t("forms.questionTitle")}</Label>
              <Input
                id="question-title"
                value={selected.title}
                onChange={(event) => updateQuestion(selected.id, { title: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="question-help">{t("forms.questionHelp")}</Label>
              <Input
                id="question-help"
                value={selected.help ?? ""}
                onChange={(event) => updateQuestion(selected.id, { help: event.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={selected.required}
                onCheckedChange={(checked) => updateQuestion(selected.id, { required: checked === true })}
              />
              {t("forms.required")}
            </label>
            <div className="space-y-1.5">
              <Label>{t("forms.matchWeight")}</Label>
              <Select
                value={String(selected.match?.weight ?? 0)}
                onValueChange={(value) => {
                  if (value == null) return
                  const weight = Number(value) as MatchWeight
                  updateQuestion(selected.id, {
                    match: weight === 0 ? undefined : { weight, ideal: selected.match?.ideal },
                  })
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
            {(selected.match?.weight ?? 0) > 0 && (
              <MatchIdeal question={selected} onChange={(ideal) => updateQuestion(selected.id, { match: { weight: selected.match?.weight ?? 1, ideal } })} />
            )}
            {isChoiceType(selected.type) && (
              <div className="space-y-2">
                <Label>{t("forms.options")}</Label>
                {(selected.options ?? []).map((option, optionIndex) => (
                  <div key={`${selected.id}-${optionIndex}`} className="flex items-center gap-2">
                    <Input
                      value={option}
                      placeholder={t("forms.optionPlaceholder")}
                      onChange={(event) => {
                        const options = [...(selected.options ?? [])]
                        options[optionIndex] = event.target.value
                        updateQuestion(selected.id, { options })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("forms.removeOption")}
                      onClick={() => {
                        const options = (selected.options ?? []).filter((_, index) => index !== optionIndex)
                        updateQuestion(selected.id, { options })
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuestion(selected.id, { options: [...(selected.options ?? []), ""] })}
                >
                  {t("forms.addOption")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="border-t border-zinc-100 pt-4 text-sm text-zinc-500">{t("forms.emptyQuestions")}</p>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 xl:sticky xl:top-24 xl:self-start">
        <FormRunner key={selected?.id ?? "empty"} form={form} preview embedded focusQuestionId={selected?.id} />
      </div>
    </div>
  )
}

function MatchIdeal({
  question,
  onChange,
}: {
  question: FormQuestion
  onChange: (ideal: string[]) => void
}) {
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
        {(question.options ?? []).filter((option) => option.trim()).map((option) => (
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
        onChange={(event) =>
          onChange(
            event.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
      />
    </div>
  )
}
