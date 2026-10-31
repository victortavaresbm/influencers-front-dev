"use client"

import { useState } from "react"
import { Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useSuggestionsStore } from "@/lib/stores/suggestions"

export function SuggestionsButton() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const add = useSuggestionsStore((state) => state.add)
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState("")
  const text = body.trim()

  function send() {
    if (!text || !user) return
    add({
      body: text,
      authorId: user.id,
      authorName: user.name,
      role: user.role,
    })
    setBody("")
    setOpen(false)
    toast.add({
      type: "success",
      title: t("suggestions.sent"),
      description: t("suggestions.sentBody"),
    })
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("suggestions.label")}
              onClick={() => setOpen(true)}
            />
          }
        >
          <Lightbulb />
        </TooltipTrigger>
        <TooltipContent side="right">{t("suggestions.label")}</TooltipContent>
      </Tooltip>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setBody("")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("suggestions.title")}</DialogTitle>
            <DialogDescription>{t("suggestions.help")}</DialogDescription>
          </DialogHeader>
          <form
            id="platform-suggestion-form"
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <Label htmlFor="platform-suggestion" className="sr-only">
              {t("suggestions.placeholder")}
            </Label>
            <Textarea
              id="platform-suggestion"
              value={body}
              placeholder={t("suggestions.placeholder")}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-28"
            />
          </form>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {t("suggestions.cancel")}
            </DialogClose>
            <Button type="submit" form="platform-suggestion-form" disabled={!text}>
              {t("suggestions.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
