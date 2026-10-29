"use client"

import { Mail } from "lucide-react"
import { SiWhatsapp } from "react-icons/si"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/toast"

export function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  const international = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${international}`
}

async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email)
    toast.add({ type: "success", title: "E-mail copiado", description: email })
  } catch {
    toast.add({ type: "error", title: "Não foi possível copiar o e-mail" })
  }
}

export function CreatorContact({
  email,
  phone,
  showPhone = false,
}: {
  email: string
  phone: string
  showPhone?: boolean
}) {
  const href = whatsappUrl(phone)

  return (
    <TooltipProvider delay={300}>
      <div className="flex flex-wrap items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
        {href && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size={showPhone ? "sm" : "icon-sm"}
                  className={showPhone ? "px-2 font-normal text-zinc-600" : undefined}
                  aria-label={`Abrir WhatsApp ${phone}`}
                  render={<a href={href} target="_blank" rel="noopener noreferrer" />}
                />
              }
            >
              <SiWhatsapp
                data-icon={showPhone ? "inline-start" : undefined}
                className={showPhone ? "text-[#25D366]" : "size-3.5 text-[#25D366]"}
              />
              {showPhone && <span>{phone}</span>}
            </TooltipTrigger>
            <TooltipContent>{showPhone ? "Abrir conversa" : `WhatsApp · ${phone}`}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="max-w-44 px-2 font-normal text-zinc-600"
                aria-label={`Copiar e-mail ${email}`}
                onClick={() => copyEmail(email)}
              />
            }
          >
            <Mail data-icon="inline-start" />
            <span className="truncate">{email}</span>
          </TooltipTrigger>
          <TooltipContent>Copiar e-mail</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
