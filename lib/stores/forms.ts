"use client"

import { create } from "zustand"
import { scoreApplication } from "@/lib/forms/brief-check"
import { cloneSite, defaultSite } from "@/lib/mock-data/form-site"
import {
  FORM_RESPONSES,
  FORMS,
  questionsFromTemplate,
  type ApplicationForm,
  type FormAnswer,
  type FormResponse,
  type FormScope,
  type FormStatus,
  type FormTemplate,
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
  campaignId?: string
}

interface SubmitInput {
  formId: string
  creatorId: string
  creatorName: string
  creatorHandle: string
  answers: FormAnswer[]
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
}

export const useFormStore = create<FormState>()((set, get) => ({
  forms: FORMS,
  responses: FORM_RESPONSES,
  createForm: (input) => {
    const stamp = today()
    const form: ApplicationForm = {
      id: `form_${crypto.randomUUID()}`,
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      scope: input.scope ?? "brand",
      campaignId: input.campaignId,
      title: input.title,
      description: input.description ?? "",
      status: "rascunho",
      questions: questionsFromTemplate(input.template),
      site: defaultSite(ORG_LOGOS[input.organizationId]?.color ?? "#18181b"),
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
    const existing = get().responses.find(
      (response) => response.formId === input.formId && response.creatorId === input.creatorId,
    )
    if (existing) return existing
    const form = get().forms.find((item) => item.id === input.formId)
    if (!form || form.status !== "publicado") return null
    const response: FormResponse = {
      id: `resp_${crypto.randomUUID()}`,
      formId: input.formId,
      creatorId: input.creatorId,
      creatorName: input.creatorName,
      creatorHandle: input.creatorHandle,
      submittedAt: new Date().toISOString(),
      answers: input.answers,
      matchScore: scoreApplication(form, input.answers).score,
    }
    set((state) => ({ responses: [response, ...state.responses] }))
    return response
  },
}))
