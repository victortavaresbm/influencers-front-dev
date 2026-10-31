"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n"
import type { ContentQuestion } from "@/lib/mock-data/content"
import type { Locale } from "@/lib/stores/preferences"
import { useAuthStore } from "@/lib/stores/auth"
import { useContentStore } from "@/lib/stores/content"

const PREVIEW_COUNT = 4

function timeAgo(iso: string, locale: Locale) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))
  const format = new Intl.RelativeTimeFormat(locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR", { numeric: "auto" })
  if (minutes < 60) return format.format(-minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (hours < 24) return format.format(-hours, "hour")
  return format.format(-Math.round(hours / 24), "day")
}

export function QuestionsButton({ count, onClick }: { count: number; onClick: () => void }) {
  const { t } = useI18n()
  return (
    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onClick}>
      <MessageCircle />
      {t("content.questions")}
      {count > 0 && <span className="text-muted-foreground">{count}</span>}
    </Button>
  )
}

export function PageQuestions({
  pageId,
  canManage,
  inputRef,
}: {
  pageId: string
  canManage: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const { t, locale } = useI18n()
  const user = useAuthStore((state) => state.user)
  const questions = useContentStore((state) => state.questions)
    .filter((question) => question.pageId === pageId)
    .slice()
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
  const addQuestion = useContentStore((state) => state.addQuestion)
  const [body, setBody] = useState("")
  const [open, setOpen] = useState(false)
  const preview = questions.slice(-PREVIEW_COUNT)
  const hasMore = questions.length > PREVIEW_COUNT
  const countLabel = questions.length === 1
    ? t("content.questionCountOne")
    : t("content.questionCount", { count: questions.length })

  return (
    <Card id="content-questions" className="w-full gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>{t("content.questions")}</CardTitle>
        <CardDescription>
          {questions.length > 0 && <>{countLabel} · </>}
          <span className="text-xs">{t("content.questionsHelp")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        {questions.length === 0 ? (
          <div>
            <p className="text-sm font-medium text-foreground">{t("content.questionsEmpty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("content.questionsEmptyHelp")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <QuestionList questions={preview} locale={locale} />
            {hasMore && (
              <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
                {t("content.questionsMore")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("content.questions")}</DialogTitle>
            <DialogDescription>
              {countLabel} · <span className="text-xs">{t("content.questionsHelp")}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(28rem,70vh)] overflow-y-auto pr-1">
            <QuestionList questions={questions} locale={locale} />
          </div>
        </DialogContent>
      </Dialog>
      <form
        className="grid gap-2 border-t px-4 py-4"
        onSubmit={(event) => {
          event.preventDefault()
          const text = body.trim()
          if (!text) return
          addQuestion({
            pageId,
            authorId: user?.id ?? "guest",
            authorName: user?.name ?? "Você",
            authorAvatar: user?.avatar ?? "??",
            authorPhoto: user?.photo,
            body: text,
          })
          setBody("")
          inputRef.current?.focus()
        }}
      >
        <Label htmlFor="page-question" className="sr-only">{t("content.questionPlaceholder")}</Label>
        <Textarea
          id="page-question"
          ref={inputRef}
          value={body}
          placeholder={t("content.questionPlaceholder")}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-16"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" variant={canManage ? "outline" : "default"} disabled={!body.trim()}>
            {t("content.sendQuestion")}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function QuestionList({ questions, locale }: { questions: ContentQuestion[]; locale: Locale }) {
  return (
    <ul className="flex flex-col gap-4">
      {questions.map((question) => (
        <li key={question.id} className="flex gap-2.5">
          <Avatar size="sm">
            {question.authorPhoto && <AvatarImage src={question.authorPhoto} alt="" />}
            <AvatarFallback>{question.authorAvatar}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">{question.authorName}</span>{" "}
              <span className="text-xs text-muted-foreground">{timeAgo(question.createdAt, locale)}</span>
            </p>
            <p className="mt-1 text-sm leading-5">{question.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
