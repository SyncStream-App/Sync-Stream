import { create } from 'zustand'

export const usePostStore = create((set) => ({
  feed: [],

  setFeed: (posts) => set({ feed: posts }),

  addPost: (post) =>
    set((state) => ({
      feed: [post, ...state.feed],
    })),

  updatePost: (postId, updates) =>
    set((state) => ({
      feed: state.feed.map((post) =>
        post.id === postId
          ? { ...post, ...updates }
          : post
      ),
    })),

  deletePost: (postId) =>
    set((state) => ({
      feed: state.feed.filter(
        (post) => post.id !== postId
      ),
    })),
}))