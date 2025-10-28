import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    console.log('[WEB] API Request:', config.method?.toUpperCase(), config.url, config.params)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('[WEB] Request Error:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[WEB] API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('[WEB] Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    })
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===== Auth =====
export const authApi = {
  getGoogleLoginUrl: () => api.get('/auth/google'),
  getMetaLoginUrl: () => api.get('/auth/meta'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// ===== YouTube =====
export const youtubeApi = {
  getChannels: () => api.get('/youtube/channels'),
  syncChannels: () => api.post('/youtube/channels/sync'),
  getVideos: (channelId: string) => api.get('/youtube/videos', { params: { channelId } }),
  getComments: (videoId: string) => api.get('/youtube/comments', { params: { videoId } }),
  syncComments: (videoId: string) => api.post('/youtube/comments/sync', { videoId }),
  deleteComment: (commentId: string) => api.delete(`/youtube/comments/${commentId}`),
  replyComment: (commentId: string, text: string) => api.post(`/youtube/comments/${commentId}/reply`, { text }),
  moderateComment: (commentId: string, status: string) => api.post(`/youtube/comments/${commentId}/moderate`, { status }),
}

// ===== Instagram =====
export const instagramApi = {
  getPages: () => api.get('/instagram/pages'),
  syncPages: () => api.post('/instagram/pages/sync'),
  getMedia: (pageId: string) => api.get('/instagram/media', { params: { pageId } }),
  getComments: (mediaId: string) => api.get('/instagram/comments', { params: { mediaId } }),
  syncComments: (mediaId: string, pageId: string) => api.post('/instagram/comments/sync', { mediaId, pageId }),
  hideComment: (commentId: string, pageId: string) => api.post(`/instagram/comments/${commentId}/hide`, { pageId }),
  unhideComment: (commentId: string, pageId: string) => api.post(`/instagram/comments/${commentId}/unhide`, { pageId }),
  deleteComment: (commentId: string, pageId: string) => api.delete(`/instagram/comments/${commentId}`, { data: { pageId } }),
  replyComment: (commentId: string, pageId: string, message: string) => api.post(`/instagram/comments/${commentId}/reply`, { pageId, message }),
  subscribeWebhook: (pageId: string) => api.post(`/instagram/pages/${pageId}/subscribe`),
  unsubscribeWebhook: (pageId: string) => api.post(`/instagram/pages/${pageId}/unsubscribe`),
  getWebhookStatus: (pageId: string) => api.get(`/instagram/pages/${pageId}/webhooks`),
}

// ===== Moderation =====
export const moderationApi = {
  getRules: () => api.get('/moderation/rules'),
  createRule: (data: any) => api.post('/moderation/rules', data),
  updateRule: (ruleId: string, data: any) => api.patch(`/moderation/rules/${ruleId}`, data),
  deleteRule: (ruleId: string) => api.delete(`/moderation/rules/${ruleId}`),
  simulate: (text: string, platform?: string) => api.post('/moderation/simulate', { text, platform }),
  getActions: (params?: any) => api.get('/moderation/actions', { params }),
  getStats: () => api.get('/moderation/stats'),
}

export default api
