import React, { useEffect, useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import { Routes, Route } from 'react-router-dom';
import InputForm from './pages/InputForm';
import ReportGenerator from './pages/ReportGenerator';
import Sidebar from './Sidebar';
import PrivateRoute from './PrivateRoute';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import NotApprovedPage from './NotApprovedPage';
import UserApproval from './pages/UserApproval';
import CatalogPage from './pages/CatalogPage';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] font-sans transition-colors duration-300 ease-in-out">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
          >
            {darkMode ? 'Light Mode 🌞' : 'Dark Mode 🌙'}
          </button>
        </div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/not-approved" element={<NotApprovedPage />} />
          <Route path="/input" element={<PrivateRoute><InputForm /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportGenerator /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/catalog" element={<PrivateRoute><CatalogPage /></PrivateRoute>} />
          <Route path="/user-approval" element={<PrivateRoute><UserApproval /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}
