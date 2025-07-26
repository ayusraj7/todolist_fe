export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: User;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string;
  };
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface TaskForm {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  tags: string[];
}


export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
} 