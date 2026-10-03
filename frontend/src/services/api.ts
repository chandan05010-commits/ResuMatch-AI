import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

import type { ApiError } from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL || 'http://localhost:8001'

/* ============================================================
   TOKEN HELPERS
   ============================================================ */

const getStoredTokens = () => {
  try {
    const storedTokens = localStorage.getItem('tokens')

    if (!storedTokens) {
      return null
    }

    const tokens = JSON.parse(storedTokens)

    if (!tokens || typeof tokens !== 'object') {
      return null
    }

    return tokens
  } catch {
    return null
  }
}

const getAccessToken = (): string | null => {
  const tokens = getStoredTokens()

  if (
    tokens &&
    typeof tokens.access_token === 'string' &&
    tokens.access_token.length > 0
  ) {
    return tokens.access_token
  }

  return null
}

const getRefreshToken = (): string | null => {
  const tokens = getStoredTokens()

  if (
    tokens &&
    typeof tokens.refresh_token === 'string' &&
    tokens.refresh_token.length > 0
  ) {
    return tokens.refresh_token
  }

  return null
}

const clearAuthStorage = () => {
  localStorage.removeItem('tokens')
  localStorage.removeItem('user')
}

/* ============================================================
   ERROR MESSAGE HELPER
   ============================================================ */

const getApiErrorMessage = (error: unknown): string => {
  const axiosError = error as {
    response?: {
      data?: {
        detail?:
          | string
          | Array<{
              msg?: string
            }>
      }
    }
    message?: string
  }

  const detail = axiosError.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || 'Validation error')
      .join(', ')
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (
    typeof axiosError.message === 'string' &&
    axiosError.message.trim()
  ) {
    return axiosError.message
  }

  return 'Request failed'
}

/* ============================================================
   API CLIENT
   ============================================================ */

const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  })

  /* ----------------------------------------------------------
     REQUEST INTERCEPTOR
     ---------------------------------------------------------- */

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken()

      /*
       * Don't attach an access token to refresh request.
       */
      const requestUrl = config.url || ''

      const isRefreshRequest =
        requestUrl.includes('/api/refresh')

      if (
        token &&
        !isRefreshRequest &&
        config.headers
      ) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  /* ----------------------------------------------------------
     RESPONSE INTERCEPTOR
     ---------------------------------------------------------- */

  client.interceptors.response.use(
    (response) => response,

    async (
      error: AxiosError<ApiError>
    ) => {
      const originalRequest =
        error.config as
          | (InternalAxiosRequestConfig & {
              _retry?: boolean
            })
          | undefined

      /*
       * No request config = nothing to retry.
       */
      if (!originalRequest) {
        return Promise.reject(error)
      }

      const requestUrl = originalRequest.url || ''

      /*
       * Never try to refresh the refresh request itself.
       */
      const isRefreshRequest =
        requestUrl.includes('/api/refresh')

      /*
       * Only handle 401.
       */
      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        isRefreshRequest
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      const refreshToken = getRefreshToken()

      /*
       * No refresh token available.
       */
      if (!refreshToken) {
        clearAuthStorage()

        window.location.href = '/login'

        return Promise.reject(error)
      }

      try {
        /*
         * Use raw axios here.
         *
         * This is important because the refresh request
         * must NOT go through the same interceptor.
         */
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/refresh`,
          {
            refresh_token: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          }
        )

        const responseData = refreshResponse.data

        const accessToken =
          responseData?.access_token

        const newRefreshToken =
          responseData?.refresh_token

        const tokenType =
          responseData?.token_type || 'bearer'

        /*
         * Make sure backend actually returned tokens.
         */
        if (
          typeof accessToken !== 'string' ||
          accessToken.length === 0
        ) {
          throw new Error(
            'Refresh response did not contain a valid access token.'
          )
        }

        const newTokens = {
          access_token: accessToken,

          /*
           * If backend does not rotate the refresh token,
           * keep the existing one.
           */
          refresh_token:
            typeof newRefreshToken === 'string' &&
            newRefreshToken.length > 0
              ? newRefreshToken
              : refreshToken,

          token_type: tokenType,
        }

        localStorage.setItem(
          'tokens',
          JSON.stringify(newTokens)
        )

        /*
         * Attach the new access token to the original request.
         */
        if (originalRequest.headers) {
          originalRequest.headers.Authorization =
            `Bearer ${accessToken}`
        }

        /*
         * Retry the original request exactly once.
         */
        return client(originalRequest)

      } catch (refreshError: unknown) {
        /*
         * Refresh failed.
         *
         * This normally means the refresh token is invalid,
         * expired, malformed, or rejected by backend.
         */
        console.error(
          'Token refresh failed:',
          getApiErrorMessage(refreshError)
        )

        clearAuthStorage()

        /*
         * Don't redirect repeatedly if already on login.
         */
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }
  )

  return client
}

/* ============================================================
   CLIENTS
   ============================================================ */

export const api = createApiClient(API_BASE_URL)

export const aiApi =
  createApiClient(AI_API_BASE_URL)

/* ============================================================
   AUTH API
   ============================================================ */

export const authApi = {
  register: (data: {
    email: string
    password: string
    full_name: string
  }) =>
    api.post('/api/register', data),

  login: (data: {
    email: string
    password: string
  }) => {
    const formData = new URLSearchParams()

    formData.append(
      'username',
      data.email
    )

    formData.append(
      'password',
      data.password
    )

    return api.post(
      '/api/login',
      formData,
      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
      }
    )
  },

  logout: () =>
    api.post('/api/logout'),

  me: () =>
    api.get('/api/me'),

  refresh: (refresh_token: string) =>
    axios.post(
      `${API_BASE_URL}/api/refresh`,
      {
        refresh_token,
      },
      {
        headers: {
          'Content-Type':
            'application/json',
        },
      }
    ),

  requestPasswordReset: (
    email: string
  ) =>
    api.post(
      '/api/password-reset/request',
      { email }
    ),

  resetPassword: (
    token: string,
    password: string
  ) =>
    api.post(
      '/api/password-reset/confirm',
      {
        token,
        password,
      }
    ),
}

/* ============================================================
   RESUME API
   ============================================================ */

export const resumeApi = {
  upload: (
    file: File,
    onProgress?: (
      progress: number
    ) => void
  ) => {
    const formData = new FormData()

    formData.append(
      'file',
      file
    )

    return api.post(
      '/api/resumes/upload',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },

        onUploadProgress: (
          progressEvent
        ) => {
          if (
            onProgress &&
            progressEvent.total
          ) {
            const progress =
              Math.round(
                (progressEvent.loaded *
                  100) /
                  progressEvent.total
              )

            onProgress(progress)
          }
        },
      }
    )
  },

  list: (
    page = 1,
    pageSize = 20
  ) =>
    api.get(
      '/api/resumes',
      {
        params: {
          page,
          page_size: pageSize,
        },
      }
    ),

  get: (id: string) =>
    api.get(
      `/api/resumes/${id}`
    ),

  delete: (id: string) =>
    api.delete(
      `/api/resumes/${id}`
    ),
}

/* ============================================================
   ANALYSIS API
   ============================================================ */

export const analysisApi = {
  analyze: (data: {
    resume_id: string
    target_job_title: string
    job_description: string
    job_description_id?: string
  }) =>
    api.post(
      '/api/analyze',
      data
    ),

  list: (
    page = 1,
    pageSize = 20
  ) =>
    api.get(
      '/api/analysis',
      {
        params: {
          page,
          page_size: pageSize,
        },
      }
    ),

  get: (id: string) =>
    api.get(
      `/api/analysis/${id}`
    ),

  getResult: (id: string) =>
    api.get(
      `/api/analysis/${id}/result`
    ),

  delete: (id: string) =>
    api.delete(
      `/api/analysis/${id}`
    ),
}

/* ============================================================
   APPLICATION API
   ============================================================ */

export const applicationApi = {
  create: (data: {
    company: string
    job_title: string
    application_date: string
    job_url?: string
    status?: string
    notes?: string
  }) =>
    api.post(
      '/api/applications',
      data
    ),

  list: (
    page = 1,
    pageSize = 20,
    status?: string
  ) =>
    api.get(
      '/api/applications',
      {
        params: {
          page,
          page_size: pageSize,
          status,
        },
      }
    ),

  get: (id: string) =>
    api.get(
      `/api/applications/${id}`
    ),

  update: (
    id: string,
    data: Partial<{
      company: string
      job_title: string
      application_date: string
      job_url: string
      status: string
      notes: string
    }>
  ) =>
    api.put(
      `/api/applications/${id}`,
      data
    ),

  delete: (id: string) =>
    api.delete(
      `/api/applications/${id}`
    ),
}

/* ============================================================
   DASHBOARD API
   ============================================================ */

export const dashboardApi = {
  getStats: () =>
    api.get(
      '/api/dashboard/stats'
    ),

  getHistory: (
    page = 1,
    pageSize = 10
  ) =>
    api.get(
      '/api/dashboard/history',
      {
        params: {
          page,
          page_size: pageSize,
        },
      }
    ),
}

/* ============================================================
   AI ANALYSIS API
   ============================================================ */

export const aiAnalysisApi = {
  parseResume: (
    text: string
  ) =>
    aiApi.post(
      '/analyze/resume',
      { text }
    ),

  parseJob: (
    text: string
  ) =>
    aiApi.post(
      '/analyze/job',
      { text }
    ),

  match: (
    resumeText: string,
    jobText: string
  ) =>
    aiApi.post(
      '/analyze/match',
      {
        resume_text: resumeText,
        job_text: jobText,
      }
    ),

  analyzeBullets: (
    bullets: string[]
  ) =>
    aiApi.post(
      '/analyze/bullets',
      { bullets }
    ),

  analyzeWording: (
    text: string
  ) =>
    aiApi.post(
      '/analyze/wording',
      { text }
    ),
}