import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        // No refresh token available; redirect to login immediately
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API functions
export const api = {
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
    getMe: () => apiClient.get('/auth/me'),
  },
  tracks: {
    getAll: (params?: any) => apiClient.get('/tracks', { params }),
    getOne: (id: string) => apiClient.get(`/tracks/${id}`),
    enroll: (id: string) => apiClient.post(`/tracks/${id}/enroll`),
    getProgress: (id: string) => apiClient.get(`/tracks/${id}/progress`),
  },
  lessons: {
    getOne: (id: string) => apiClient.get(`/lessons/${id}`),
    markComplete: (id: string) => apiClient.post(`/lessons/${id}/complete`),
  },
  challenges: {
    getOne: (id: string) => apiClient.get(`/challenges/${id}`),
    getSubmissions: (id: string) => apiClient.get(`/challenges/${id}/submissions`),
  },
  submissions: {
    submit: (data: any) => apiClient.post('/submissions', data),
    getOne: (id: string) => apiClient.get(`/submissions/${id}`),
    getReview: (id: string) => apiClient.get(`/submissions/${id}/review`),
  },
  certificates: {
    getAll: () => apiClient.get('/certificates'),
    getOne: (id: string) => apiClient.get(`/certificates/${id}`),
    generate: (trackId: string) => apiClient.post('/certificates/generate', null, { params: { trackId } }),
    download: (id: string) => apiClient.get(`/certificates/${id}/download`),
    verify: (code: string) => apiClient.get(`/certificates/verify/${code}`),
  },
  chat: {
    query: (message: string) => apiClient.post('/chat/query', { message }),
    getHistory: () => apiClient.get('/chat/history'),
  },
};
