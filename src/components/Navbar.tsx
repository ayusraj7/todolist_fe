import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn: boolean;
  user?: { username: string; avatar?: string } | null;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="w-full bg-blue-600 py-4 px-6 flex justify-between items-center shadow">
      <Link to="/" className="text-white text-xl font-bold">Task Manager</Link>
      {isLoggedIn && user ? (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-white">{user.username}</span>
          <button onClick={onLogout} className="bg-gray-100 text-blue-600 px-4 py-2 rounded hover:bg-gray-200 font-semibold transition">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          {location.pathname !== '/login' && (
            <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 font-semibold transition">Login</Link>
          )}
          {location.pathname !== '/register' && (
            <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 font-semibold transition">Sign Up</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
