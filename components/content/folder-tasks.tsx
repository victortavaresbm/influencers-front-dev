"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useContentStore } from "@/lib/stores/content"
import { cn } from "@/lib/utils"

export function FolderTasks({
  folderId,
  folderTitle,
  canManage,
}: {
  folderId: string
  folderTitle: string
  canManage: boolean
}) {
  const { t } = useI18n()
  const userId = useAuthStore((state) => state.user?.id ?? "guest")
  const tasks = useContentStore((state) => state.tasks).filter((task) => task.folderId === folderId)
  const doneIds = useContentStore((state) => state.taskDone)
    .filter((item) => item.userId === userId)
    .map((item) => item.taskId)
  const addTask = useContentStore((state) => state.addTask)
  const deleteTask = useContentStore((state) => state.deleteTask)
  const toggleTask = useContentStore((state) => state.toggleTask)
  const [draft, setDraft] = useState("")
  const done = tasks.filter((task) => doneIds.includes(task.id)).length

  if (!canManage && tasks.length === 0) return null

  const summary = tasks.length === 0
    ? folderTitle
    : canManage
      ? `${tasks.length === 1 ? t("content.taskOne") : t("content.taskCount", { count: tasks.length })} · ${folderTitle}`
      : `${t("content.taskProgress", { done, total: tasks.length })} · ${folderTitle}`

  return (
    <Card className="w-full gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>{t("content.tasks")}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("content.tasksEmpty")}</p>
        ) : (
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {tasks.map((task) => {
              const checked = doneIds.includes(task.id)
              return (
                <li key={task.id} className="group flex items-start gap-2 rounded-md py-1">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={checked}
                    aria-label={task.title}
                    className="mt-0.5"
                    onCheckedChange={() => toggleTask(task.id, userId)}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={cn("min-w-0 flex-1 cursor-pointer text-sm leading-5", checked && "text-muted-foreground line-through")}
                  >
                    {task.title}
                  </label>
                  {canManage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                      aria-label={t("content.deleteTask")}
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {canManage && (
          <form
            className={cn("flex items-center gap-1", tasks.length > 0 && "mt-3")}
            onSubmit={(event) => {
              event.preventDefault()
              const title = draft.trim()
              if (!title) return
              addTask(folderId, title)
              setDraft("")
            }}
          >
            <Input
              value={draft}
              aria-label={t("content.addTaskItem")}
              placeholder={t("content.taskPlaceholder")}
              onChange={(event) => setDraft(event.target.value)}
              className="h-7 min-w-0 flex-1 text-sm"
            />
            <Button type="submit" size="sm" variant="outline" disabled={!draft.trim()}>
              {t("content.addTask")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
