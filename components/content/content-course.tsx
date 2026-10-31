"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, FilePlus, FileText, FolderPlus, Image as ImageIcon, Pencil, Trash2, Video } from "lucide-react"
import { ContentEditor } from "@/components/content/content-editor"
import { ContentHtml } from "@/components/content/content-html"
import { FolderTasks } from "@/components/content/folder-tasks"
import { PageQuestions, QuestionsButton } from "@/components/content/page-questions"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { readContentHtml } from "@/lib/content-media"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useContentStore } from "@/lib/stores/content"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { cn } from "@/lib/utils"

export function ContentCourse({ courseId, canManage }: { courseId: string; canManage: boolean }) {
  const router = useRouter()
  const { t } = useI18n()
  const course = useContentStore((state) => state.courses.find((item) => item.id === courseId))
  const folders = useContentStore((state) => state.folders)
  const pages = useContentStore((state) => state.pages)
  const setCourseStatus = useContentStore((state) => state.setCourseStatus)
  const deleteCourse = useContentStore((state) => state.deleteCourse)
  const addFolder = useContentStore((state) => state.addFolder)
  const renameFolder = useContentStore((state) => state.renameFolder)
  const setFolderStatus = useContentStore((state) => state.setFolderStatus)
  const deleteFolder = useContentStore((state) => state.deleteFolder)
  const addPage = useContentStore((state) => state.addPage)
  const updatePage = useContentStore((state) => state.updatePage)
  const setPageStatus = useContentStore((state) => state.setPageStatus)
  const movePage = useContentStore((state) => state.movePage)
  const deletePage = useContentStore((state) => state.deletePage)
  const questions = useContentStore((state) => state.questions)

  const editorRef = useRef<HTMLDivElement>(null)
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState("")
  const [titlePageId, setTitlePageId] = useState<string | null>(null)
  const [draftKey, setDraftKey] = useState(0)
  const [folderDialog, setFolderDialog] = useState<{ id?: string; name: string } | null>(null)

  const backHref = canManage ? "/content" : "/creator/content"
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const { selectedId: partnerId } = usePartnerCommunity()

  useEffect(() => {
    if (!course?.organizationId) return
    if (canManage) {
      if (organizationId && course.organizationId !== organizationId) router.replace(backHref)
      return
    }
    if (!partnerId || course.organizationId === partnerId) return
    router.replace(backHref)
  }, [canManage, course, organizationId, partnerId, router, backHref])
  const courseFolders = folders.filter((folder) => folder.courseId === courseId && (canManage || folder.status === "published"))
  const coursePages = pages.filter((page) => page.courseId === courseId && (canManage || page.status === "published"))
  const rootPages = coursePages.filter((page) => page.folderId === null)
  const firstPageId = rootPages[0]?.id ?? coursePages[0]?.id ?? null
  const [pickedId, setPickedId] = useState<string | null>(firstPageId)
  const [pickedCourseId, setPickedCourseId] = useState(courseId)
  if (pickedCourseId !== courseId) {
    setPickedCourseId(courseId)
    setPickedId(firstPageId)
  }
  const selectedId = pickedId && coursePages.some((page) => page.id === pickedId) ? pickedId : firstPageId
  const selected = coursePages.find((page) => page.id === selectedId) ?? null
  if ((selected?.id ?? null) !== titlePageId) {
    setTitlePageId(selected?.id ?? null)
    setTitle(selected?.title ?? "")
  }

  if (!course || (!canManage && course.status !== "published")) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="p-6">
          <p className="text-sm text-muted-foreground">{course ? t("content.unavailable") : t("content.notFound")}</p>
          <Button variant="outline" className="mt-4" render={<Link href={backHref} />}>
            {t("pages.back")}
          </Button>
        </div>
      </div>
    )
  }

  function pagesIn(folderId: string) {
    return coursePages.filter((page) => page.folderId === folderId)
  }

  function createPage(folderId: string | null) {
    const pageId = addPage({ courseId, folderId, title: t("content.newPage") })
    setPickedId(pageId)
  }

  function focusQuestions() {
    document.getElementById("content-questions")?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    questionRef.current?.focus()
  }

  const questionCount = selected ? questions.filter((question) => question.pageId === selected.id).length : 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <Button variant="outline" size="sm" render={<Link href={backHref} />}>
          <ArrowLeft />
          {t("pages.back")}
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-foreground">{course.title}</h1>
          {course.description && <p className="truncate text-sm text-muted-foreground">{course.description}</p>}
        </div>
        {canManage && (
          <ActionsMenu
            items={[
              {
                label: course.status === "published" ? t("content.unpublish") : t("content.publish"),
                icon: course.status === "published" ? EyeOff : Eye,
                onSelect: () => setCourseStatus(course.id, course.status === "published" ? "draft" : "published"),
              },
              {
                label: t("content.delete"),
                icon: Trash2,
                destructive: true,
                onSelect: () => {
                  deleteCourse(course.id)
                  router.push(backHref)
                },
              },
            ]}
          />
        )}
      </div>

      <div className={cn("grid min-w-0 flex-1 items-start", selected ? "lg:grid-cols-[16rem_minmax(0,1fr)_18rem]" : "lg:grid-cols-[16rem_minmax(0,1fr)]")}>
        <aside className="border-b border-border p-4 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:border-r lg:border-b-0">
          {canManage && (
            <ActionsMenu
              items={[
                { label: t("content.addPage"), icon: FilePlus, onSelect: () => createPage(null) },
                { label: t("content.addFolder"), icon: FolderPlus, onSelect: () => setFolderDialog({ name: "" }) },
              ]}
            />
          )}
          <ul className={cn("flex flex-col gap-1", canManage && "mt-4")}>
            {rootPages.map((page) => (
              <PageRow
                key={page.id}
                title={page.title}
                body={page.body}
                draft={page.status === "draft"}
                selected={selected?.id === page.id}
                canManage={canManage}
                draftLabel={t("content.draft")}
                onSelect={() => setPickedId(page.id)}
              />
            ))}
            {courseFolders.map((folder) => (
              <li key={folder.id} className="mt-2">
                <div className="flex items-center gap-1 px-2 py-1">
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">{folder.title}</span>
                  {canManage && folder.status === "draft" && (
                    <span className="text-[11px] text-muted-foreground">{t("content.draft")}</span>
                  )}
                  {canManage && (
                    <ActionsMenu
                      trigger="ellipsis"
                      items={[
                        {
                          label: t("content.renameFolder"),
                          icon: Pencil,
                          onSelect: () => setFolderDialog({ id: folder.id, name: folder.title }),
                        },
                        {
                          label: t("content.addPage"),
                          icon: FilePlus,
                          onSelect: () => createPage(folder.id),
                        },
                        {
                          label: folder.status === "published" ? t("content.unpublish") : t("content.publish"),
                          icon: folder.status === "published" ? EyeOff : Eye,
                          onSelect: () => setFolderStatus(folder.id, folder.status === "published" ? "draft" : "published"),
                        },
                        {
                          label: t("content.delete"),
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => deleteFolder(folder.id),
                        },
                      ]}
                    />
                  )}
                </div>
                <ul className="flex flex-col gap-1">
                  {pagesIn(folder.id).map((page) => (
                    <PageRow
                      key={page.id}
                      title={page.title}
                      body={page.body}
                      draft={page.status === "draft"}
                      selected={selected?.id === page.id}
                      canManage={canManage}
                      draftLabel={t("content.draft")}
                      nested
                      onSelect={() => setPickedId(page.id)}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-w-0 p-6">
          {selected ? (
            canManage ? (
              <div className="mx-auto grid max-w-3xl gap-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={selected.status === "published" ? "secondary" : "outline"}>
                    {selected.status === "published" ? t("content.published") : t("content.draft")}
                  </Badge>
                  <ActionsMenu
                    items={[
                      {
                        label: selected.status === "draft" ? t("content.publish") : t("content.unpublish"),
                        icon: selected.status === "draft" ? Eye : EyeOff,
                        onSelect: () => setPageStatus(selected.id, selected.status === "draft" ? "published" : "draft"),
                      },
                      ...(selected.folderId
                        ? [{
                            label: t("content.moveRoot"),
                            icon: FileText,
                            onSelect: () => movePage(selected.id, null),
                          }]
                        : []),
                      ...courseFolders
                        .filter((folder) => folder.id !== selected.folderId)
                        .map((folder) => ({
                          label: t("content.moveTo", { name: folder.title }),
                          icon: FolderPlus,
                          onSelect: () => movePage(selected.id, folder.id),
                        })),
                      {
                        label: t("content.delete"),
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => {
                          setPickedId(null)
                          deletePage(selected.id)
                        },
                      },
                    ]}
                  />
                </div>
                <ContentEditor
                  key={`${selected.id}-${draftKey}`}
                  editorRef={editorRef}
                  initialHtml={selected.body}
                  label={t("content.pageBody")}
                >
                  <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                    <Label htmlFor="page-title" className="sr-only">{t("content.titleField")}</Label>
                    <Input
                      id="page-title"
                      value={title}
                      aria-label={t("content.titleField")}
                      placeholder={t("content.titleField")}
                      onChange={(event) => setTitle(event.target.value)}
                      className="h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 md:text-2xl dark:bg-transparent"
                    />
                    <QuestionsButton count={questionCount} onClick={focusQuestions} />
                  </div>
                </ContentEditor>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setTitle(selected.title)
                      setDraftKey((current) => current + 1)
                    }}
                  >
                    {t("content.cancel")}
                  </Button>
                  <Button
                    type="button"
                    disabled={!title.trim()}
                    onClick={() => updatePage(selected.id, { title: title.trim(), body: readContentHtml(editorRef.current) })}
                  >
                    {t("content.save")}
                  </Button>
                </div>
              </div>
            ) : (
              <article className="mx-auto max-w-3xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{selected.title}</h2>
                  <QuestionsButton count={questionCount} onClick={focusQuestions} />
                </div>
                <ContentHtml html={selected.body} className="lesson-copy mt-4 text-sm leading-6 text-foreground" />
              </article>
            )
          ) : (
            <div className="mx-auto max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground">{t("content.noPage")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{course.description || t("content.noPageHelp")}</p>
            </div>
          )}
        </section>
        {selected && (
          <div className="flex flex-col gap-4 px-6 pb-6 lg:sticky lg:top-28 lg:py-6 lg:pr-6 lg:pl-0">
            {selected.folderId && (
              <FolderTasks
                folderId={selected.folderId}
                folderTitle={courseFolders.find((folder) => folder.id === selected.folderId)?.title ?? ""}
                canManage={canManage}
              />
            )}
            <PageQuestions pageId={selected.id} canManage={canManage} inputRef={questionRef} />
          </div>
        )}
      </div>

      <Dialog open={folderDialog !== null} onOpenChange={(next) => !next && setFolderDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{folderDialog?.id ? t("content.renameFolder") : t("content.newFolder")}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              const name = folderDialog?.name.trim() ?? ""
              if (!name || !folderDialog) return
              if (folderDialog.id) renameFolder(folderDialog.id, name)
              else addFolder(courseId, name)
              setFolderDialog(null)
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="folder-name">{t("content.folderName")}</Label>
              <Input
                id="folder-name"
                value={folderDialog?.name ?? ""}
                onChange={(event) => setFolderDialog((current) => (current ? { ...current, name: event.target.value } : current))}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>{t("content.cancel")}</DialogClose>
              <Button type="submit" disabled={!folderDialog?.name.trim()}>
                {folderDialog?.id ? t("content.save") : t("content.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PageRow({
  title,
  body,
  draft,
  selected,
  nested,
  canManage,
  draftLabel,
  onSelect,
}: {
  title: string
  body: string
  draft: boolean
  selected: boolean
  nested?: boolean
  canManage: boolean
  draftLabel: string
  onSelect: () => void
}) {
  const Icon = /<(iframe|video)\b/i.test(body) ? Video : /<img\b/i.test(body) ? ImageIcon : FileText
  return (
    <li className={cn(nested && "pl-3")}>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
          selected ? "bg-muted text-foreground" : "text-foreground hover:bg-muted/60",
        )}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className={cn("block truncate", draft && "text-muted-foreground")}>{title}</span>
          {canManage && draft && <span className="block text-[11px] text-muted-foreground">{draftLabel}</span>}
        </span>
      </button>
    </li>
  )
}
