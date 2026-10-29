"use client"

import { create } from "zustand"
import {
  COMMUNITY_COMMENTS,
  COMMUNITY_POSTS,
  type CommunityAuthor,
  type CommunityComment,
  type CommunityPost,
} from "@/lib/mock-data/community"

interface CommunityState {
  posts: CommunityPost[]
  comments: CommunityComment[]
  createPost: (input: { title: string; body: string; categoryId: string; author: CommunityAuthor; campaignId?: string }) => void
  togglePostLike: (postId: string) => void
  togglePin: (postId: string) => void
  addComment: (input: { postId: string; parentId?: string; body: string; author: CommunityAuthor }) => void
  toggleCommentLike: (commentId: string) => void
}

export const useCommunityStore = create<CommunityState>()((set) => ({
  posts: COMMUNITY_POSTS,
  comments: COMMUNITY_COMMENTS,
  createPost: ({ title, body, categoryId, author, campaignId }) =>
    set((state) => ({
      posts: [
        {
          id: `post-${crypto.randomUUID()}`,
          title,
          body,
          categoryId,
          author,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          likedByMe: false,
          isPinned: false,
          campaignId,
        },
        ...state.posts,
      ],
    })),
  togglePostLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likeCount: post.likeCount + (post.likedByMe ? -1 : 1),
            }
          : post
      ),
    })),
  togglePin: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) => (post.id === postId ? { ...post, isPinned: !post.isPinned } : post)),
    })),
  addComment: ({ postId, parentId, body, author }) =>
    set((state) => ({
      comments: [
        ...state.comments,
        {
          id: `comment-${crypto.randomUUID()}`,
          postId,
          parentId,
          author,
          body,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          likedByMe: false,
        },
      ],
    })),
  toggleCommentLike: (commentId) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likedByMe: !comment.likedByMe,
              likeCount: comment.likeCount + (comment.likedByMe ? -1 : 1),
            }
          : comment
      ),
    })),
}))
