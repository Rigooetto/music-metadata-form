import React from 'react';
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
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/not-approved" element={<NotApprovedPage />} />
          <Route path="/input" element={<PrivateRoute><InputForm /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportGenerator /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><UserApproval /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="*" element={<div>Welcome to LabelMind.ai</div>} />
          <Route path="/catalog" element={<PrivateRoute><CatalogPage /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}
