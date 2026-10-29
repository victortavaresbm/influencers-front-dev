import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { PreferencesSync } from "@/components/preferences-sync"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"

const themeBootScript = `(function(){try{var raw=localStorage.getItem("wesell-preferences");if(!raw)return;var state=JSON.parse(raw).state||{};var root=document.documentElement;if(state.theme==="dark"){root.classList.add("dark");root.style.colorScheme="dark";}var locale=state.locale;root.lang=locale==="en"?"en":locale==="es"?"es":"pt-BR";}catch(e){}})();`

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WeSell Influencer",
  description: "Plataforma de marketing de influência",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PreferencesSync />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
