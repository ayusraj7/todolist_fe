import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { AuthUser, RegisterForm } from '../../types';
import {
  containerClass,
  cardClass,
  buttonClass,
  inputClass,
  errorClass,
  headingClass
} from '../../styles/twClasses';

interface RegisterProps {
  onLogin: (user: AuthUser, token: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(formData);
      const { token, user } = response.data;
      onLogin(user, token);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerClass + ' min-h-screen flexCenterClass'}>
      <div className={cardClass + ' w-full max-w-md'}>
        <h2 className={headingClass + ' text-center'}>Register</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClass + (errors.username ? ' border-red-500' : '')}
              placeholder="Enter your username"
            />
            {errors.username && <div className={errorClass}>{errors.username}</div>}
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass + (errors.email ? ' border-red-500' : '')}
              placeholder="Enter your email"
            />
            {errors.email && <div className={errorClass}>{errors.email}</div>}
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass + (errors.password ? ' border-red-500' : '')}
              placeholder="Enter your password"
            />
            {errors.password && <div className={errorClass}>{errors.password}</div>}
          </div>

          {errors.general && <div className={errorClass}>{errors.general}</div>}

          <button
            type="submit"
            className={buttonClass + ' w-full'}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 