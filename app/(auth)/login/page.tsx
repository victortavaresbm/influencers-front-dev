"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RealSignIn } from "@/components/auth/real-sign-in"
import { isRealUser } from "@/components/auth/clerk-bridge"
import { clerkEnabled } from "@/lib/api/clerk"

const QUICK_LOGINS = [
  { name: "Natura", email: "ana@natura.com.br", role: "brand" as const },
  { name: "Magalu", email: "carlos@magalu.com.br", role: "brand" as const },
  { name: "iFood", email: "juliana@ifood.com.br", role: "brand" as const },
  { name: "Bianca Torres", email: "bianca@gmail.com", role: "creator" as const },
  { name: "Pedro Alves", email: "pedro@gmail.com", role: "creator" as const },
  { name: "Carolina Souza", email: "carol@gmail.com", role: "creator" as const },
]

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    await new Promise((r) => setTimeout(r, 500))
    const result = login(email, password)
    setLoading(false)
    if (!result.success) {
      setError(t("login.invalid"))
      return
    }
    const user = useAuthStore.getState().user
    goAfterLogin(user?.role)
  }

  const goAfterLogin = (role?: "brand" | "creator") => {
    const returnTo = new URLSearchParams(window.location.search).get("return")
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
      router.push(returnTo)
      return
    }
    router.push(role === "brand" ? "/dashboard" : "/creator/dashboard")
  }

  // The Clerk modal signs in outside this form; ClerkBridge then sets the user.
  const realUser = useAuthStore((s) => (isRealUser(s.user) ? s.user : null))
  useEffect(() => {
    if (realUser) goAfterLogin("brand")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realUser])

  const quickLogin = async (qEmail: string) => {
    setLoading(true)
    setError("")
    await new Promise((r) => setTimeout(r, 300))
    const result = login(qEmail, "123456")
    setLoading(false)
    if (!result.success) return
    const user = useAuthStore.getState().user
    goAfterLogin(user?.role)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black text-white p-12">
        <div>
          <span className="text-xl font-semibold tracking-tight">WeSell</span>
          <span className="text-zinc-400 text-xl"> Influencer</span>
        </div>
        <div>
          <blockquote className="text-2xl font-light leading-relaxed text-zinc-100 max-w-sm">
            &ldquo;{t("login.quote")}&rdquo;
          </blockquote>
          <p className="mt-4 text-zinc-400 text-sm">{t("login.tagline")}</p>
        </div>
        <div className="text-zinc-500 text-xs">© 2026 WeSell Software</div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col flex-1 items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{t("login.title")}</h1>
            <p className="mt-1 text-sm text-zinc-500">{t("login.subtitle")}</p>
          </div>

          {clerkEnabled && <RealSignIn />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-zinc-400 mb-3 font-medium uppercase tracking-wide">
              {t("login.quickAccess")}
            </p>
            <div className="grid gap-2">
              {QUICK_LOGINS.map((q) => (
                <button
                  key={q.email}
                  onClick={() => quickLogin(q.email)}
                  disabled={loading}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 text-sm text-left hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  <span className="font-medium text-zinc-800">
                    {q.role === "brand" ? t("login.brand") : t("login.creator")} — {q.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      q.role === "brand"
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {q.role === "brand" ? "Marca" : "Creator"}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400">Senha padrão: 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
