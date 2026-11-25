import { MediaCover } from "@/components/forms/media-field"
import type { ApplicationForm, FormQuestion } from "@/lib/mock-data/forms"
import type { SiteBlock } from "@/lib/mock-data/form-site"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function FormCardPreview({ form }: { form: ApplicationForm }) {
  const { t } = useI18n()
  const page =
    form.site?.pages.find((item) => item.id === form.site?.entryPageId) ??
    form.site?.pages.find((item) => item.kind === "landing") ??
    form.site?.pages[0]
  const banner = page?.blocks.find((block): block is Extract<SiteBlock, { type: "banner" }> => block.type === "banner")
  const primary = form.site?.theme.primary ?? ORG_LOGOS[form.organizationId]?.color ?? "#18181b"
  const questions = form.questions.slice(0, 3)
  const lightBanner = banner?.tone === "light"

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-muted" aria-hidden>
      {banner ? (
        <div className="absolute inset-x-0 top-0 h-[46%]" style={{ background: banner.background }}>
          {banner.image ? (
            <MediaCover src={banner.image} className="pointer-events-none absolute inset-0 size-full object-cover opacity-50" />
          ) : null}
          <div
            className={cn(
              "relative flex h-full flex-col justify-end gap-1.5 bg-gradient-to-t from-black/45 to-transparent p-3",
              lightBanner ? "text-white" : "text-zinc-900",
            )}
          >
            <p className="line-clamp-2 text-sm font-semibold leading-tight">{banner.title}</p>
            {banner.ctaLabel.trim() ? (
              <span
                className="w-fit rounded-md px-2 py-0.5 text-xs font-medium text-white"
                style={{ background: primary }}
              >
                {banner.ctaLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 top-0 flex h-[46%] flex-col justify-end gap-1 bg-white px-3 pb-2">
          <div className="mb-1 h-1 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full w-1/5 rounded-full" style={{ background: primary }} />
          </div>
          <p className="line-clamp-1 text-sm font-semibold leading-tight text-zinc-900">{form.title}</p>
          {form.description ? <p className="line-clamp-2 text-xs leading-snug text-zinc-500">{form.description}</p> : null}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-[54%] overflow-hidden border-t border-zinc-200 bg-white px-3 py-2.5">
        {questions.length === 0 ? (
          <p className="text-xs text-zinc-400">{t("forms.emptyQuestions")}</p>
        ) : (
          <div className="space-y-2">
            {questions.map((question) => (
              <QuestionSketch key={question.id} question={question} />
            ))}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  )
}

function QuestionSketch({ question }: { question: FormQuestion }) {
  const { t } = useI18n()

  return (
    <div>
      <p className="truncate text-xs font-medium text-zinc-800">
        {question.title}
        {question.required ? <span className="text-zinc-400"> *</span> : null}
      </p>
      {question.type === "yes_no" ? (
        <div className="mt-1 flex gap-1">
          <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500">{t("forms.yes")}</span>
          <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500">{t("forms.no")}</span>
        </div>
      ) : question.type === "single_choice" || question.type === "multiple_choice" ? (
        <div className="mt-1 space-y-1">
          {(question.options ?? []).slice(0, 2).map((option) => (
            <div key={option} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-2.5 shrink-0 border border-zinc-300",
                  question.type === "single_choice" ? "rounded-full" : "rounded-[3px]",
                )}
              />
              <span className="truncate text-xs text-zinc-500">{option}</span>
            </div>
          ))}
        </div>
      ) : question.type === "social_links" ? (
        <div className="mt-1 space-y-1">
          {["Instagram", "TikTok", "YouTube"].map((network) => (
            <div key={network} className="h-4 rounded-md border border-zinc-200 bg-zinc-50" />
          ))}
        </div>
      ) : (
        <div className={cn("mt-1 rounded-md border border-zinc-200 bg-zinc-50", question.type === "long_text" ? "h-8" : "h-5")} />
      )}
    </div>
  )
}
