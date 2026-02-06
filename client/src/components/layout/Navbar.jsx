import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { FaSignOutAlt, FaUserCircle, FaColumns, FaMoon, FaSun } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 h-16 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-50 backdrop-blur">
      <Link
        to="/dashboard"
        className="text-2xl font-bold text-primary flex items-center gap-2 hover:text-primary/80 no-underline"
      >
        <FaColumns /> KanbanFlow
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={toggleTheme}
          className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-200 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
        </button>
        <div className="hidden sm:flex items-center gap-2 text-slate-800 dark:text-slate-100 font-medium">
          <FaUserCircle size={20} />
          {user?.username}
        </div>
        <Button onClick={handleLogout} className="py-2 px-4 text-sm">
          <FaSignOutAlt className="mr-2" /> Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
