import axios, { AxiosResponse } from 'axios';
import { AuthResponse, Task, User, LoginForm, RegisterForm, TaskForm } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: RegisterForm): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),

  login: (data: LoginForm): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),

  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/me'),

  updateProfile: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put('/auth/profile', data),
};

export const taskAPI = {
  getTasks: (params?: {
    status?: string;
    search?: string;
  }): Promise<AxiosResponse<Task[]>> =>
    api.get('/tasks', { params }),

  getTask: (id: string): Promise<AxiosResponse<Task>> =>
    api.get(`/tasks/${id}`),

  createTask: (data: TaskForm): Promise<AxiosResponse<Task>> =>
    api.post('/tasks', data),

  updateTask: (id: string, data: Partial<TaskForm>): Promise<AxiosResponse<Task>> =>
    api.put(`/tasks/${id}`, data),

  deleteTask: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/tasks/${id}`),

};

export const userAPI = {
  getUsers: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),

  getUser: (id: string): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),
};

export default api; 