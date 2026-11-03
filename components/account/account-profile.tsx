"use client"

import { useEffect, useRef, useState } from "react"
import { Eye, EyeOff, KeyRound, UserRound } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { nameInitials } from "@/lib/mock-data/users"
import { useAuthStore } from "@/lib/stores/auth"

const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"]
const PHOTO_LIMIT = 5 * 1024 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = "photo" | "name" | "email" | "currentPassword" | "newPassword" | "confirmPassword"
type PasswordVisibility = "current" | "next" | "confirm"

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  revealed,
  error,
  showLabel,
  hideLabel,
  onChange,
  onToggle,
}: {
  id: string
  label: string
  autoComplete: string
  value: string
  revealed: boolean
  error?: MessageKey
  showLabel: string
  hideLabel: string
  onChange: (value: string) => void
  onToggle: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={revealed ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={revealed ? hideLabel : showLabel}
            aria-pressed={revealed}
            onClick={onToggle}
          >
            {revealed ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {t(error)}
        </p>
      ) : null}
    </div>
  )
}

function resizePhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("read"))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error("image"))
      image.onload = () => {
        const size = 256
        const scale = Math.min(size / image.width, size / image.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("canvas"))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export default function AccountProfilePage() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [photo, setPhoto] = useState(user?.photo)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Partial<Record<Field, MessageKey>>>({})
  const [readingPhoto, setReadingPhoto] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<PasswordVisibility, boolean>>({
    current: false,
    next: false,
    confirm: false,
  })

  useEffect(() => {
    const current = useAuthStore.getState().user
    if (!current) return
    setName(current.name)
    setEmail(current.email)
    setPhoto(current.photo)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
  }, [user?.id])

  const savedName = user?.name ?? ""
  const savedEmail = user?.email ?? ""
  const savedPhoto = user?.photo
  const passwordTouched = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0
  const dirty =
    name.trim() !== savedName ||
    email.trim() !== savedEmail ||
    photo !== savedPhoto ||
    passwordTouched

  const reset = () => {
    setName(savedName)
    setEmail(savedEmail)
    setPhoto(savedPhoto)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
  }

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    if (!PHOTO_TYPES.includes(file.type) || file.size > PHOTO_LIMIT) {
      setErrors((current) => ({ ...current, photo: "profile.photoInvalid" }))
      return
    }
    setReadingPhoto(true)
    try {
      const next = await resizePhoto(file)
      setPhoto(next)
      setErrors((current) => ({ ...current, photo: undefined }))
    } catch {
      setErrors((current) => ({ ...current, photo: "profile.photoInvalid" }))
    } finally {
      setReadingPhoto(false)
    }
  }

  const save = () => {
    const nextErrors: Partial<Record<Field, MessageKey>> = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName) nextErrors.name = "profile.nameRequired"
    if (!trimmedEmail) nextErrors.email = "profile.emailRequired"
    else if (!EMAIL_PATTERN.test(trimmedEmail)) nextErrors.email = "profile.emailInvalid"

    if (passwordTouched) {
      if (!currentPassword) nextErrors.currentPassword = "profile.passwordCurrentRequired"
      if (!newPassword) nextErrors.newPassword = "profile.passwordNewRequired"
      else if (newPassword.length < 6) nextErrors.newPassword = "profile.passwordShort"
      if (newPassword && confirmPassword !== newPassword) nextErrors.confirmPassword = "profile.passwordMismatch"
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const result = updateProfile({
      name: trimmedName,
      email: trimmedEmail,
      photo,
      currentPassword: passwordTouched ? currentPassword : undefined,
      newPassword: passwordTouched ? newPassword : undefined,
    })
    if (!result.success) {
      const field = result.error === "profile.emailTaken" ? "email" : "currentPassword"
      setErrors({ [field]: result.error })
      return
    }

    setName(trimmedName)
    setEmail(trimmedEmail)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
    toast.add({ type: "success", title: t("profile.saved"), description: t("profile.savedBody") })
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("profile.title")} subtitle={t("profile.subtitle")} />
      <form
        className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6"
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              {t("profile.account")}
            </CardTitle>
            <CardDescription>{t("profile.accountHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                {photo ? <AvatarImage src={photo} alt="" /> : null}
                <AvatarFallback className="text-base">{nameInitials(name || savedName)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{t("profile.photo")}</p>
                <p className="text-sm text-muted-foreground">{t("profile.photoHelp")}</p>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={readingPhoto}
                    onClick={() => fileRef.current?.click()}
                  >
                    {t("profile.changePhoto")}
                  </Button>
                </div>
                {errors.photo ? (
                  <p role="alert" className="text-sm text-destructive">
                    {t(errors.photo)}
                  </p>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                tabIndex={-1}
                className="sr-only"
                onChange={(event) => {
                  void onPhoto(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="profile-name">{t("profile.name")}</Label>
              <Input
                id="profile-name"
                autoComplete="name"
                value={name}
                aria-invalid={errors.name ? true : undefined}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.name ? (
                <p role="alert" className="text-sm text-destructive">
                  {t(errors.name)}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="profile-email">{t("profile.email")}</Label>
              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={errors.email ? true : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email ? (
                <p role="alert" className="text-sm text-destructive">
                  {t(errors.email)}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-muted-foreground" />
              {t("profile.passwordTitle")}
            </CardTitle>
            <CardDescription>{t("profile.passwordHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PasswordField
              id="profile-current-password"
              label={t("profile.currentPassword")}
              autoComplete="current-password"
              value={currentPassword}
              revealed={visiblePasswords.current}
              error={errors.currentPassword}
              showLabel={t("profile.showPassword")}
              hideLabel={t("profile.hidePassword")}
              onChange={setCurrentPassword}
              onToggle={() => setVisiblePasswords((current) => ({ ...current, current: !current.current }))}
            />
            <PasswordField
              id="profile-new-password"
              label={t("profile.newPassword")}
              autoComplete="new-password"
              value={newPassword}
              revealed={visiblePasswords.next}
              error={errors.newPassword}
              showLabel={t("profile.showPassword")}
              hideLabel={t("profile.hidePassword")}
              onChange={setNewPassword}
              onToggle={() => setVisiblePasswords((current) => ({ ...current, next: !current.next }))}
            />
            <PasswordField
              id="profile-confirm-password"
              label={t("profile.confirmPassword")}
              autoComplete="new-password"
              value={confirmPassword}
              revealed={visiblePasswords.confirm}
              error={errors.confirmPassword}
              showLabel={t("profile.showPassword")}
              hideLabel={t("profile.hidePassword")}
              onChange={setConfirmPassword}
              onToggle={() => setVisiblePasswords((current) => ({ ...current, confirm: !current.confirm }))}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={reset} disabled={!dirty}>
            {t("profile.cancel")}
          </Button>
          <Button type="submit" disabled={!dirty || readingPhoto}>
            {t("profile.save")}
          </Button>
        </div>
      </form>
    </div>
  )
}
