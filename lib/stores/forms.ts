"use client"

import { create } from "zustand"
import { scoreApplication } from "@/lib/forms/brief-check"
import { cloneSite, defaultSite, type FormSite } from "@/lib/mock-data/form-site"
import {
  FORM_RESPONSES,
  FORMS,
  questionsFromTemplate,
  type ApplicationForm,
  type FormAnswer,
  type FormQuestion,
  type FormResponse,
  type FormScope,
  type LeadDecision,
  type FormStatus,
  type FormTemplate,
  type ResponseTracking,
  type StepEvent,
} from "@/lib/mock-data/forms"
import { ORG_LOGOS } from "@/lib/mock-data/users"

function today() {
  return new Date().toISOString().slice(0, 10)
}

function settle(forms: ApplicationForm[], next: ApplicationForm) {
  return forms.map((form) => {
    if (form.id === next.id) return next
    if (
      next.status === "publicado" &&
      next.scope === "campaign" &&
      next.campaignId &&
      form.scope === "campaign" &&
      form.campaignId === next.campaignId &&
      form.status === "publicado"
    ) {
      return { ...form, status: "rascunho" as const, updatedAt: next.updatedAt }
    }
    return form
  })
}

interface CreateFormInput {
  organizationId: string
  organizationName: string
  template: FormTemplate
  title: string
  description?: string
  scope?: FormScope
  // A ready-made funnel site (from a template). When omitted, a default funnel
  // is built from the template's seed questions.
  site?: FormSite
  // Explicit question set (e.g. a market template's questions).
  questions?: FormQuestion[]
  // Landing-only funnel: no application questions/form step.
  landingOnly?: boolean
  campaignId?: string
}

interface SubmitInput {
  formId: string
  sessionId?: string
  creatorId?: string
  creatorName: string
  creatorHandle: string
  answers: FormAnswer[]
}

interface SaveLeadInput {
  formId: string
  sessionId: string
  creatorId?: string
  creatorName?: string
  creatorHandle?: string
  leadEmail?: string
  answers: FormAnswer[]
  stage: string
  complete: boolean
  tracking?: ResponseTracking
  stepEvents?: StepEvent[]
}

interface FormState {
  forms: ApplicationForm[]
  responses: FormResponse[]
  createForm: (input: CreateFormInput) => ApplicationForm
  updateForm: (id: string, patch: Partial<ApplicationForm>) => void
  duplicateForm: (id: string, title: string) => ApplicationForm | null
  archiveForm: (id: string) => void
  deleteForm: (id: string) => void
  submitResponse: (input: SubmitInput) => FormResponse | null
  // Upsert an incremental lead by (formId, sessionId): merges the latest
  // answers, advances the stage and appends step events as the visitor moves
  // through the funnel. Marks the lead complete when it reaches a final page.
  saveLead: (input: SaveLeadInput) => FormResponse | null
  decideLead: (id: string, decision: LeadDecision) => void
}

export const useFormStore = create<FormState>()((set, get) => ({
  forms: FORMS,
  responses: FORM_RESPONSES,
  createForm: (input) => {
    const stamp = today()
    const color = ORG_LOGOS[input.organizationId]?.color ?? "#18181b"
    // A template may carry its own questions; a blank funnel seeds them from the
    // template kind. A provided site keeps its own questions (field blocks).
    const questions = input.questions ?? (input.landingOnly || input.site ? [] : questionsFromTemplate(input.template))
    const site = input.site ?? defaultSite(color, questions.map((question) => question.id))
    const form: ApplicationForm = {
      id: `form_${crypto.randomUUID()}`,
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      scope: input.scope ?? "brand",
      campaignId: input.campaignId,
      title: input.title,
      description: input.description ?? "",
      status: "rascunho",
      questions,
      site,
      createdAt: stamp,
      updatedAt: stamp,
    }
    set((state) => ({ forms: [form, ...state.forms] }))
    return form
  },
  updateForm: (id, patch) =>
    set((state) => {
      const current = state.forms.find((form) => form.id === id)
      if (!current) return state
      const next: ApplicationForm = {
        ...current,
        ...patch,
        id: current.id,
        updatedAt: today(),
      }
      return { forms: settle(state.forms, next) }
    }),
  duplicateForm: (id, title) => {
    const current = get().forms.find((form) => form.id === id)
    if (!current) return null
    const stamp = today()
    const copy: ApplicationForm = {
      ...current,
      id: `form_${crypto.randomUUID()}`,
      title,
      status: "rascunho",
      questions: current.questions.map((question) => ({
        ...question,
        id: `q_${crypto.randomUUID()}`,
        options: question.options ? [...question.options] : undefined,
        match: question.match ? { ...question.match, ideal: question.match.ideal ? [...question.match.ideal] : undefined } : undefined,
      })),
      createdAt: stamp,
      updatedAt: stamp,
    }
    const questionIds = new Map(current.questions.map((question, index) => [question.id, copy.questions[index].id]))
    copy.site = current.site ? cloneSite(current.site, questionIds) : undefined
    set((state) => ({ forms: [copy, ...state.forms] }))
    return copy
  },
  archiveForm: (id) =>
    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === id ? { ...form, status: "arquivado" as FormStatus, updatedAt: today() } : form,
      ),
    })),
  deleteForm: (id) =>
    set((state) => ({
      forms: state.forms.filter((form) => form.id !== id),
      responses: state.responses.filter((response) => response.formId !== id),
    })),
  submitResponse: (input) => {
    const sessionId = input.sessionId ?? input.creatorId ?? `sess_${crypto.randomUUID()}`
    const existing = get().responses.find(
      (response) =>
        response.formId === input.formId &&
        (response.sessionId === sessionId || (!!input.creatorId && response.creatorId === input.creatorId)),
    )
    if (existing) return existing
    const form = get().forms.find((item) => item.id === input.formId)
    if (!form || form.status !== "publicado") return null
    const response: FormResponse = {
      id: `resp_${crypto.randomUUID()}`,
      formId: input.formId,
      sessionId,
      creatorId: input.creatorId,
      creatorName: input.creatorName,
      creatorHandle: input.creatorHandle,
      submittedAt: new Date().toISOString(),
      complete: true,
      stage: input.answers[input.answers.length - 1]?.questionId ?? "",
      answers: input.answers,
      matchScore: scoreApplication(form, input.answers).score,
    }
    set((state) => ({ responses: [response, ...state.responses] }))
    return response
  },
  saveLead: (input) => {
    const form = get().forms.find((item) => item.id === input.formId)
    if (!form || form.status !== "publicado") return null
    const existing = get().responses.find(
      (response) => response.formId === input.formId && response.sessionId === input.sessionId,
    )
    const matchScore = input.complete ? scoreApplication(form, input.answers).score : existing?.matchScore
    const leadEmail = input.leadEmail ?? existing?.leadEmail
    const next: FormResponse = {
      id: existing?.id ?? `resp_${crypto.randomUUID()}`,
      formId: input.formId,
      sessionId: input.sessionId,
      creatorId: input.creatorId ?? existing?.creatorId,
      creatorName: input.creatorName || existing?.creatorName || leadEmail || "",
      creatorHandle: input.creatorHandle ?? existing?.creatorHandle ?? "",
      leadEmail,
      submittedAt: existing?.submittedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      complete: input.complete || (existing?.complete ?? false),
      stage: input.stage,
      answers: input.answers,
      matchScore,
      decision: existing?.decision,
      tracking: input.tracking ?? existing?.tracking,
      stepEvents: [...(existing?.stepEvents ?? []), ...(input.stepEvents ?? [])],
    }
    set((state) => ({
      responses: existing
        ? state.responses.map((response) => (response.id === existing.id ? next : response))
        : [next, ...state.responses],
    }))
    return next
  },
  decideLead: (id, decision) =>
    set((state) => ({
      responses: state.responses.map((response) =>
        response.id === id ? { ...response, decision, updatedAt: new Date().toISOString() } : response,
      ),
    })),
}))
