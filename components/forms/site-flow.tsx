"use client"

import { ArrowDown, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isChoiceType, type ApplicationForm } from "@/lib/mock-data/forms"
import { firstFormPageId, siteFlow, uid, type FlowCondition, type FormSite } from "@/lib/mock-data/form-site"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function SiteFlow({
  form,
  site,
  selectedPageId,
  onSelectPage,
  onChange,
}: {
  form: ApplicationForm
  site: FormSite
  selectedPageId: string
  onSelectPage: (id: string) => void
  onChange: (site: FormSite) => void
}) {
  const { t } = useI18n()
  const graph = siteFlow(site)
  const outgoing = (from: string) => graph.edges.filter((edge) => edge.from === from)
  const formPageId = firstFormPageId(site)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{t("forms.flowTitle")}</h3>
        <p className="mt-1 text-sm text-zinc-500">{t("forms.flowHelp")}</p>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        {site.pages
          .filter((page) => page.id === site.entryPageId || page.kind === "landing")
          .map((page) => (
            <NodeCard
              key={page.id}
              label={page.name}
              badges={[
                page.id === site.entryPageId ? t("forms.entryBadge") : "",
                page.kind === "landing" ? t("forms.kindLanding") : "",
              ]}
              active={selectedPageId === page.id}
              onClick={() => onSelectPage(page.id)}
            />
          ))}
        {outgoing(site.entryPageId).map((edge) => (
          <EdgeLabel key={edge.id} label={edge.label} />
        ))}
        {graph.nodes.some((node) => node.kind === "form") ? (
          <>
            <NodeCard
              label={t("forms.flowFormNode")}
              badges={[t("forms.briefCheck")]}
              accent
              active={Boolean(formPageId) && selectedPageId === formPageId}
              onClick={formPageId ? () => onSelectPage(formPageId) : undefined}
            />
            {outgoing("form").map((edge) => (
              <div key={edge.id} className="flex w-full max-w-sm flex-col items-center">
                <EdgeLabel label={edge.label} />
                <NodeCard
                  label={site.pages.find((page) => page.id === edge.to)?.name ?? edge.to}
                  badges={[
                    edge.to === site.fallbackPageId ? t("forms.fallbackBadge") : "",
                    site.pages.find((page) => page.id === edge.to)?.kind === "thanks" ? t("forms.kindThanks") : "",
                  ]}
                  active={selectedPageId === edge.to}
                  onClick={() => onSelectPage(edge.to)}
                />
              </div>
            ))}
          </>
        ) : null}
        {site.pages
          .filter((page) => page.kind === "custom")
          .map((page) => (
            <NodeCard
              key={page.id}
              label={page.name}
              badges={[t("forms.kindCustom")]}
              active={selectedPageId === page.id}
              onClick={() => onSelectPage(page.id)}
            />
          ))}
      </div>

      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-zinc-900">{t("forms.flowRules")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...site,
                rules: [
                  ...site.rules,
                  { id: uid("rule"), condition: { kind: "score", min: 70 }, pageId: site.fallbackPageId },
                ],
              })
            }
          >
            <Plus />
            {t("forms.addRule")}
          </Button>
        </div>
        {site.rules.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("forms.flowHelp")}</p>
        ) : (
          site.rules.map((rule) => (
            <div key={rule.id} className="grid gap-2 rounded-lg border border-zinc-100 p-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-1.5">
                <Label>{t("forms.ruleKind")}</Label>
                <Select
                  value={rule.condition.kind}
                  onValueChange={(value) => {
                    if (!value) return
                    const condition: FlowCondition =
                      value === "score"
                        ? { kind: "score", min: 70 }
                        : value === "answer"
                          ? { kind: "answer", questionId: form.questions[0]?.id ?? "", value: "" }
                          : { kind: "always" }
                    onChange({
                      ...site,
                      rules: site.rules.map((item) => (item.id === rule.id ? { ...item, condition } : item)),
                    })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value) =>
                        value === "score"
                          ? t("forms.ruleScore")
                          : value === "answer"
                            ? t("forms.ruleAnswer")
                            : t("forms.ruleAlways")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">{t("forms.ruleScore")}</SelectItem>
                    <SelectItem value="answer">{t("forms.ruleAnswer")}</SelectItem>
                    <SelectItem value="always">{t("forms.ruleAlways")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {rule.condition.kind === "score" ? (
                <div className="space-y-1.5">
                  <Label>{t("forms.ruleMin")}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={rule.condition.min}
                    onChange={(event) =>
                      onChange({
                        ...site,
                        rules: site.rules.map((item) =>
                          item.id === rule.id
                            ? { ...item, condition: { kind: "score", min: Number(event.target.value) || 0 } }
                            : item,
                        ),
                      })
                    }
                  />
                </div>
              ) : rule.condition.kind === "answer" ? (
                <AnswerRule
                  form={form}
                  questionId={rule.condition.questionId}
                  value={rule.condition.value}
                  onChange={(questionId, value) =>
                    onChange({
                      ...site,
                      rules: site.rules.map((item) =>
                        item.id === rule.id ? { ...item, condition: { kind: "answer", questionId, value } } : item,
                      ),
                    })
                  }
                />
              ) : (
                <div />
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t("forms.rulePage")}</Label>
                <Select
                  value={rule.pageId}
                  onValueChange={(pageId) => {
                    if (!pageId) return
                    onChange({
                      ...site,
                      rules: site.rules.map((item) => (item.id === rule.id ? { ...item, pageId } : item)),
                    })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value) => site.pages.find((page) => page.id === value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {site.pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("forms.deleteRule")}
                  onClick={() => onChange({ ...site, rules: site.rules.filter((item) => item.id !== rule.id) })}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))
        )}
        <div className="space-y-1.5">
          <Label>{t("forms.fallbackBadge")}</Label>
          <Select
            value={site.fallbackPageId}
            onValueChange={(pageId) => pageId && onChange({ ...site, fallbackPageId: pageId })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{(value) => site.pages.find((page) => page.id === value)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {site.pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function AnswerRule({
  form,
  questionId,
  value,
  onChange,
}: {
  form: ApplicationForm
  questionId: string
  value: string
  onChange: (questionId: string, value: string) => void
}) {
  const { t } = useI18n()
  const question = form.questions.find((item) => item.id === questionId)
  const options =
    question?.type === "yes_no"
      ? [
          { value: "yes", label: t("forms.yes") },
          { value: "no", label: t("forms.no") },
        ]
      : isChoiceType(question?.type ?? "short_text")
        ? (question?.options ?? []).filter((option) => option.trim()).map((option) => ({ value: option, label: option }))
        : []

  return (
    <div className="grid gap-2 sm:grid-cols-2 sm:col-span-1">
      <div className="space-y-1.5">
        <Label>{t("forms.ruleQuestion")}</Label>
        <Select value={questionId} onValueChange={(next) => next && onChange(next, "")}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(current) => form.questions.find((item) => item.id === current)?.title || t("forms.untitledQuestion")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {form.questions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.title || t("forms.untitledQuestion")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>{t("forms.ruleValue")}</Label>
        {options.length > 0 ? (
          <Select value={value} onValueChange={(next) => next && onChange(questionId, next)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(current) => options.find((option) => option.value === current)?.label ?? current}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={value} onChange={(event) => onChange(questionId, event.target.value)} />
        )}
      </div>
    </div>
  )
}

function NodeCard({
  label,
  badges,
  active,
  accent,
  onClick,
}: {
  label: string
  badges: string[]
  active?: boolean
  accent?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full max-w-sm rounded-xl border bg-white px-4 py-3 text-left",
        active ? "border-zinc-900" : "border-zinc-200",
        accent && "border-dashed",
      )}
    >
      <p className="text-sm font-medium text-zinc-900">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {badges.filter(Boolean).map((badge) => (
          <Badge key={badge} variant="secondary">
            {badge}
          </Badge>
        ))}
      </div>
    </button>
  )
}

function EdgeLabel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1 text-xs text-zinc-400">
      <ArrowDown className="size-4" />
      {label ? <span className="max-w-[220px] text-center">{label}</span> : null}
    </div>
  )
}
