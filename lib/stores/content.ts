"use client"

import { create } from "zustand"
import {
  CONTENT_COURSES,
  CONTENT_FOLDERS,
  CONTENT_PAGES,
  type ContentCourse,
  type ContentFolder,
  type ContentPage,
  type ContentStatus,
} from "@/lib/mock-data/content"

interface ContentState {
  courses: ContentCourse[]
  folders: ContentFolder[]
  pages: ContentPage[]
  createCourse: (input: { title: string; description: string; organizationId: string }) => string
  setCourseStatus: (courseId: string, status: ContentStatus) => void
  deleteCourse: (courseId: string) => void
  addFolder: (courseId: string, title: string) => string
  renameFolder: (folderId: string, title: string) => void
  setFolderStatus: (folderId: string, status: ContentStatus) => void
  deleteFolder: (folderId: string) => void
  addPage: (input: { courseId: string; folderId: string | null; title: string }) => string
  updatePage: (pageId: string, input: { title: string; body: string }) => void
  setPageStatus: (pageId: string, status: ContentStatus) => void
  movePage: (pageId: string, folderId: string | null) => void
  deletePage: (pageId: string) => void
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export const useContentStore = create<ContentState>()((set) => ({
  courses: CONTENT_COURSES,
  folders: CONTENT_FOLDERS,
  pages: CONTENT_PAGES,
  createCourse: ({ title, description, organizationId }) => {
    const courseId = id("course")
    set((state) => ({
      courses: [...state.courses, { id: courseId, organizationId, title, description, status: "draft" }],
    }))
    return courseId
  },
  setCourseStatus: (courseId, status) =>
    set((state) => ({
      courses: state.courses.map((course) => (course.id === courseId ? { ...course, status } : course)),
    })),
  deleteCourse: (courseId) =>
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== courseId),
      folders: state.folders.filter((folder) => folder.courseId !== courseId),
      pages: state.pages.filter((page) => page.courseId !== courseId),
    })),
  addFolder: (courseId, title) => {
    const folderId = id("folder")
    set((state) => ({
      folders: [...state.folders, { id: folderId, courseId, title, status: "published" }],
    }))
    return folderId
  },
  renameFolder: (folderId, title) =>
    set((state) => ({
      folders: state.folders.map((folder) => (folder.id === folderId ? { ...folder, title } : folder)),
    })),
  setFolderStatus: (folderId, status) =>
    set((state) => ({
      folders: state.folders.map((folder) => (folder.id === folderId ? { ...folder, status } : folder)),
    })),
  deleteFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== folderId),
      pages: state.pages.map((page) => (page.folderId === folderId ? { ...page, folderId: null } : page)),
    })),
  addPage: ({ courseId, folderId, title }) => {
    const pageId = id("page")
    set((state) => ({
      pages: [
        ...state.pages,
        { id: pageId, courseId, folderId, title, body: "", status: "draft" },
      ],
    }))
    return pageId
  },
  updatePage: (pageId, input) =>
    set((state) => ({
      pages: state.pages.map((page) => (page.id === pageId ? { ...page, ...input } : page)),
    })),
  setPageStatus: (pageId, status) =>
    set((state) => ({
      pages: state.pages.map((page) => (page.id === pageId ? { ...page, status } : page)),
    })),
  movePage: (pageId, folderId) =>
    set((state) => ({
      pages: state.pages.map((page) => (page.id === pageId ? { ...page, folderId } : page)),
    })),
  deletePage: (pageId) =>
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== pageId),
    })),
}))
