"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { answerFilled, type AnswerValue, type ApplicationForm, type FormAnswer, type FormQuestion } from "@/lib/mock-data/forms"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function readAnswer(answers: FormAnswer[], questionId: string): AnswerValue | undefined {
  return answers.find((answer) => answer.questionId === questionId)?.value
}

function writeAnswer(answers: FormAnswer[], questionId: string, value: AnswerValue): FormAnswer[] {
  const next = answers.filter((answer) => answer.questionId !== questionId)
  return [...next, { questionId, value }]
}

export function FormRunner({
  form,
  preview = false,
  focusQuestionId,
  alreadySubmitted = false,
  embedded = false,
  onSubmit,
  onDone,
}: {
  form: ApplicationForm
  preview?: boolean
  focusQuestionId?: string
  alreadySubmitted?: boolean
  embedded?: boolean
  onSubmit?: (answers: FormAnswer[]) => void
  onDone?: () => void
}) {
  const { t } = useI18n()
  const [wasSubmitted] = useState(alreadySubmitted)
  const [phase, setPhase] = useState<"intro" | "question" | "done">(() => {
    if (wasSubmitted) return "done"
    if (preview && focusQuestionId) return "question"
    return "intro"
  })
  const [index, setIndex] = useState(() => {
    if (!focusQuestionId) return 0
    const found = form.questions.findIndex((question) => question.id === focusQuestionId)
    return found >= 0 ? found : 0
  })
  const [answers, setAnswers] = useState<FormAnswer[]>([])
  const [attempted, setAttempted] = useState(false)
  const total = form.questions.length
  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1)
  const question = form.questions[safeIndex]
  const progress = phase === "intro" ? 0 : total === 0 ? 0 : Math.round(((safeIndex + 1) / total) * 100)
  const value = question ? readAnswer(answers, question.id) : undefined
  const missing = question ? question.required && !answerFilled(question, value) : false

  const goNext = () => {
    if (!question) return
    if (question.required && !answerFilled(question, value)) {
      setAttempted(true)
      return
    }
    setAttempted(false)
    if (safeIndex >= total - 1) {
      if (!preview) onSubmit?.(answers)
      setPhase("done")
      return
    }
    setIndex(safeIndex + 1)
  }

  const onKeyDown = (event: React.KeyboardEvent, multiline = false) => {
    if (event.key !== "Enter") return
    if (multiline && !(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    goNext()
  }

  return (
    <div className={cn("flex flex-col", embedded ? "gap-4" : "mx-auto w-full max-w-xl gap-6")}>
      <Progress value={progress} aria-label={t("forms.runnerProgress", { current: phase === "intro" ? 0 : safeIndex + 1, total })}>
        <span className="text-xs text-zinc-500">
          {preview ? t("forms.previewBadge") : phase === "question" ? t("forms.runnerProgress", { current: safeIndex + 1, total }) : form.organizationName}
        </span>
      </Progress>

      {phase === "intro" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{form.title}</h2>
            {form.description ? <p className="mt-2 text-sm leading-relaxed text-zinc-600">{form.description}</p> : null}
          </div>
          <Button type="button" size="lg" disabled={total === 0} onClick={() => setPhase("question")}>
            {t("forms.start")}
          </Button>
        </div>
      )}

      {phase === "question" && question && (
        <QuestionStep
          question={question}
          value={value}
          showError={attempted && missing}
          onChange={(next) => {
            setAnswers((current) => writeAnswer(current, question.id, next))
            setAttempted(false)
          }}
          onKeyDown={onKeyDown}
        />
      )}

      {phase === "done" && (
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {wasSubmitted ? t("forms.alreadySent") : t("forms.thanks")}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            {wasSubmitted ? t("forms.alreadySentBody") : t("forms.thanksBody")}
          </p>
          {preview ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPhase("intro")
                setIndex(0)
                setAnswers([])
              }}
            >
              {t("forms.previewRestart")}
            </Button>
          ) : onDone ? (
            <Button type="button" onClick={onDone}>
              {t("forms.done")}
            </Button>
          ) : null}
        </div>
      )}

      {phase === "question" && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setAttempted(false)
              if (safeIndex === 0) setPhase("intro")
              else setIndex(safeIndex - 1)
            }}
          >
            {t("forms.back")}
          </Button>
          <Button type="button" size="lg" onClick={goNext}>
            {safeIndex >= total - 1 ? t("forms.send") : t("forms.next")}
          </Button>
        </div>
      )}
    </div>
  )
}

function QuestionStep({
  question,
  value,
  showError,
  onChange,
  onKeyDown,
}: {
  question: FormQuestion
  value: AnswerValue | undefined
  showError: boolean
  onChange: (value: AnswerValue) => void
  onKeyDown: (event: React.KeyboardEvent, multiline?: boolean) => void
}) {
  const { t } = useI18n()
  const text = typeof value === "string" ? value : ""

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          {question.title || t("forms.untitledQuestion")}
          {question.required ? <span className="text-zinc-400"> *</span> : null}
        </h2>
        {question.help ? <p className="mt-1 text-sm text-zinc-500">{question.help}</p> : null}
      </div>

      {question.type === "short_text" && (
        <Input
          value={text}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => onKeyDown(event)}
        />
      )}
      {question.type === "link" && (
        <Input
          type="url"
          inputMode="url"
          placeholder="https://"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => onKeyDown(event)}
        />
      )}
      {question.type === "number" && (
        <Input
          type="number"
          inputMode="numeric"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => onKeyDown(event)}
        />
      )}
      {question.type === "long_text" && (
        <Textarea
          value={text}
          rows={5}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => onKeyDown(event, true)}
        />
      )}
      {question.type === "yes_no" && (
        <RadioGroup value={text} onValueChange={(next) => onChange(next)} className="grid gap-2">
          <Choice id={`${question.id}-yes`} value="yes" label={t("forms.yes")} />
          <Choice id={`${question.id}-no`} value="no" label={t("forms.no")} />
        </RadioGroup>
      )}
      {question.type === "single_choice" && (
        <RadioGroup value={text} onValueChange={(next) => onChange(next)} className="grid gap-2">
          {(question.options ?? []).filter((option) => option.trim()).map((option) => (
            <Choice key={option} id={`${question.id}-${option}`} value={option} label={option} />
          ))}
        </RadioGroup>
      )}
      {question.type === "multiple_choice" && (
        <div className="grid gap-2">
          {(question.options ?? []).filter((option) => option.trim()).map((option) => {
            const selected = Array.isArray(value) ? value : []
            const checked = selected.includes(option)
            return (
              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) => {
                    const on = next === true
                    onChange(on ? [...selected, option] : selected.filter((item) => item !== option))
                  }}
                />
                <span className="text-sm text-zinc-800">{option}</span>
              </label>
            )
          })}
        </div>
      )}

      {showError ? <p className="text-sm text-red-600">{t("forms.requiredHint")}</p> : null}
    </div>
  )
}

function Choice({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2">
      <RadioGroupItem id={id} value={value} />
      <Label htmlFor={id} className="cursor-pointer font-normal">
        {label}
      </Label>
    </label>
  )
}
