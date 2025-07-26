import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '../../services/api';
import { AuthUser } from '../../types';
import {
  containerClass,
  cardClass,
  buttonClass,
  inputClass,
  errorClass,
  headingClass
} from '../../styles/twClasses';

interface LoginProps {
  onLogin: (user: AuthUser, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await authAPI.login(values);
        const { token, user } = response.data;
        onLogin(user, token);
      } catch (error: any) {
        if (error.response?.data?.message) {
          formik.setStatus(error.response.data.message);
        } else {
          formik.setStatus('An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className={containerClass + ' min-h-screen flexCenterClass'}>
      <div className={cardClass + ' w-full max-w-md'}>
        <h2 className={headingClass + ' text-center'}>Login</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass + (formik.touched.email && formik.errors.email ? ' border-red-500' : '')}
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className={errorClass}>{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass + (formik.touched.password && formik.errors.password ? ' border-red-500' : '')}
              placeholder="Enter your password"
            />
            {formik.touched.password && formik.errors.password && (
              <div className={errorClass}>{formik.errors.password}</div>
            )}
          </div>

          {formik.status && <div className={errorClass}>{formik.status}</div>}

          <button
            type="submit"
            className={buttonClass + ' w-full'}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 