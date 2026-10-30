"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { CONTENT_HOUSE_BANNERS } from "@/lib/mock-data/content"
import { useContentStore } from "@/lib/stores/content"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { useBrandSearch } from "@/components/creator/brand-shell"

export function ContentLibrary({ canManage }: { canManage: boolean }) {
  const router = useRouter()
  const { t } = useI18n()
  const organizationId = useAuthStore((state) => state.user?.organizationId) ?? "org1"
  const courses = useContentStore((state) => state.courses)
  const pages = useContentStore((state) => state.pages)
  const createCourse = useContentStore((state) => state.createCourse)
  const setCourseStatus = useContentStore((state) => state.setCourseStatus)
  const deleteCourse = useContentStore((state) => state.deleteCourse)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const { selectedId } = usePartnerCommunity()
  const brandQuery = useBrandSearch().trim().toLowerCase()

  const visible = courses
    .filter((course) =>
      canManage
        ? course.organizationId === organizationId
        : course.status === "published" && (!selectedId || course.organizationId === selectedId)
    )
    .filter((course) => !brandQuery || `${course.title} ${course.description}`.toLowerCase().includes(brandQuery))
  const base = canManage ? "/content" : "/creator/content"
  const houseId = canManage ? organizationId : selectedId
  const house = !brandQuery && houseId ? CONTENT_HOUSE_BANNERS[houseId] : undefined

  function pageCount(courseId: string) {
    return pages.filter((page) => page.courseId === courseId && (canManage || page.status === "published")).length
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        {canManage && (
          <div className="mb-4 flex justify-end">
            <Button type="button" onClick={() => setOpen(true)}>
              {t("content.new")}
            </Button>
          </div>
        )}
        {house && (
          <Link
            href={`${base}/${house.courseId}`}
            className="mb-6 block overflow-hidden rounded-xl ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="relative h-56 overflow-hidden bg-muted sm:h-72">
              <img src={house.image} alt="" className="size-full object-cover" />
              <div className="absolute inset-y-0 left-0 flex items-center p-5 sm:p-8">
                <div className="max-w-sm rounded-xl bg-background/90 p-5 shadow-sm backdrop-blur-md">
                  <img src="/logos/natura.svg" alt="Natura" className="h-5 w-auto" />
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{house.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{house.subtitle}</p>
                </div>
              </div>
            </div>
          </Link>
        )}
        {visible.length === 0 ? (
          <Card className="mx-auto max-w-lg p-8 text-center">
            <CardTitle>{t("content.emptyTitle")}</CardTitle>
            <CardDescription className="mt-1">
              {canManage ? t("content.emptyBody") : t("content.emptyCreator")}
            </CardDescription>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((course) => (
              <Card key={course.id} className="group relative h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                <Link
                  href={`${base}/${course.id}`}
                  aria-label={course.title}
                  className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {course.cover && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={course.cover}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <CardHeader className="py-4">
                  <CardTitle className="group-hover:underline">{course.title}</CardTitle>
                  {course.description && <CardDescription className="line-clamp-2">{course.description}</CardDescription>}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={course.status === "published" ? "secondary" : "outline"}>
                      {course.status === "published" ? t("content.published") : t("content.draft")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {pageCount(course.id) === 1 ? t("content.pageOne") : t("content.pages", { count: pageCount(course.id) })}
                    </span>
                  </div>
                  {canManage && (
                    <CardAction className="relative z-20">
                      <ActionsMenu
                        items={[
                          {
                            label: t("content.edit"),
                            icon: Pencil,
                            onSelect: () => router.push(`${base}/${course.id}`),
                          },
                          {
                            label: course.status === "published" ? t("content.unpublish") : t("content.publish"),
                            icon: course.status === "published" ? EyeOff : Eye,
                            onSelect: () => setCourseStatus(course.id, course.status === "published" ? "draft" : "published"),
                          },
                          {
                            label: t("content.delete"),
                            icon: Trash2,
                            destructive: true,
                            onSelect: () => deleteCourse(course.id),
                          },
                        ]}
                      />
                    </CardAction>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setTitle("")
            setDescription("")
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("content.createTitle")}</DialogTitle>
            <DialogDescription>{t("content.subtitle")}</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!title.trim()) return
              const courseId = createCourse({ title: title.trim(), description: description.trim(), organizationId })
              setOpen(false)
              router.push(`/content/${courseId}`)
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="content-title">{t("content.titleField")}</Label>
              <Input id="content-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="content-description">{t("content.descriptionField")}</Label>
              <Textarea id="content-description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>{t("content.cancel")}</DialogClose>
              <Button type="submit" disabled={!title.trim()}>
                {t("content.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
