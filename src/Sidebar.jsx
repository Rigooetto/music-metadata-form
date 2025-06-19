// src/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  FileText,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  UserCircle
} from 'lucide-react';

export default function Sidebar() {
  const [user] = useAuthState(auth);
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setDisplayName(data.name || user.displayName || user.email);
          setIsAdmin(data.role === 'admin');
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navLink = (href, label, Icon, highlight = 'text-blue-400') => {
    const isActive = location.pathname === href;
    return (
      <a
        href={href}
        className={`flex items-center gap-2 px-2 py-1 rounded ${
          isActive ? `${highlight} font-semibold` : 'text-white hover:text-blue-300'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </a>
    );
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
      <div>
        <div className="p-6 text-xl font-bold border-b border-gray-700 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          LabelMind.ai
        </div>

        <nav className="p-4 space-y-2">
          {navLink('/input', 'Input Form', ClipboardList)}
          {navLink('/reports', 'Reports', FileText)}

          {isAdmin && (
            <div className="mt-6">
              <h3 className="text-xs uppercase text-gray-400 tracking-wide mb-2">Admin</h3>
              {navLink('/admin', 'User Approval', UserCircle, 'text-yellow-400')}
              {navLink('/admin-dashboard', 'Admin Dashboard', LayoutDashboard, 'text-yellow-400')}
            </div>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="text-sm mb-2 text-gray-400">{displayName}</div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}