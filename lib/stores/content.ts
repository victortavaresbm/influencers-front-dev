"use client"

import { create } from "zustand"
import {
  CONTENT_COURSES,
  CONTENT_FOLDERS,
  CONTENT_PAGES,
  CONTENT_QUESTIONS,
  CONTENT_TASK_DONE,
  CONTENT_TASKS,
  type ContentCourse,
  type ContentFolder,
  type ContentPage,
  type ContentQuestion,
  type ContentStatus,
  type ContentTask,
  type ContentTaskDone,
} from "@/lib/mock-data/content"

interface ContentState {
  courses: ContentCourse[]
  folders: ContentFolder[]
  pages: ContentPage[]
  tasks: ContentTask[]
  taskDone: ContentTaskDone[]
  questions: ContentQuestion[]
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
  addTask: (folderId: string, title: string) => void
  deleteTask: (taskId: string) => void
  toggleTask: (taskId: string, userId: string) => void
  addQuestion: (input: Omit<ContentQuestion, "id" | "createdAt">) => void
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export const useContentStore = create<ContentState>()((set) => ({
  courses: CONTENT_COURSES,
  folders: CONTENT_FOLDERS,
  pages: CONTENT_PAGES,
  tasks: CONTENT_TASKS,
  taskDone: CONTENT_TASK_DONE,
  questions: CONTENT_QUESTIONS,
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
    set((state) => {
      const folderIds = new Set(state.folders.filter((folder) => folder.courseId === courseId).map((folder) => folder.id))
      const pageIds = new Set(state.pages.filter((page) => page.courseId === courseId).map((page) => page.id))
      const taskIds = new Set(state.tasks.filter((task) => folderIds.has(task.folderId)).map((task) => task.id))
      return {
        courses: state.courses.filter((course) => course.id !== courseId),
        folders: state.folders.filter((folder) => folder.courseId !== courseId),
        pages: state.pages.filter((page) => page.courseId !== courseId),
        tasks: state.tasks.filter((task) => !folderIds.has(task.folderId)),
        taskDone: state.taskDone.filter((item) => !taskIds.has(item.taskId)),
        questions: state.questions.filter((question) => !pageIds.has(question.pageId)),
      }
    }),
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
    set((state) => {
      const taskIds = new Set(state.tasks.filter((task) => task.folderId === folderId).map((task) => task.id))
      return {
        folders: state.folders.filter((folder) => folder.id !== folderId),
        pages: state.pages.map((page) => (page.folderId === folderId ? { ...page, folderId: null } : page)),
        tasks: state.tasks.filter((task) => task.folderId !== folderId),
        taskDone: state.taskDone.filter((item) => !taskIds.has(item.taskId)),
      }
    }),
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
      questions: state.questions.filter((question) => question.pageId !== pageId),
    })),
  addTask: (folderId, title) =>
    set((state) => ({
      tasks: [...state.tasks, { id: id("task"), folderId, title }],
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      taskDone: state.taskDone.filter((item) => item.taskId !== taskId),
    })),
  toggleTask: (taskId, userId) =>
    set((state) => {
      const done = state.taskDone.some((item) => item.taskId === taskId && item.userId === userId)
      return {
        taskDone: done
          ? state.taskDone.filter((item) => !(item.taskId === taskId && item.userId === userId))
          : [...state.taskDone, { taskId, userId }],
      }
    }),
  addQuestion: (input) =>
    set((state) => ({
      questions: [...state.questions, { ...input, id: id("question"), createdAt: new Date().toISOString() }],
    })),
}))
