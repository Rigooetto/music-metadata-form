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
  UserCircle,
  Bell,
  Plus,
  User
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isActive ? `${highlight} bg-blue-500 font-semibold` : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </a>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#1c1f26] text-white flex-col justify-between min-h-screen px-4 py-6 rounded-r-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-10 text-blue-400 text-lg font-semibold">
            <ShieldCheck className="w-6 h-6" />
            LabelMind.ai
          </div>

          <nav className="space-y-2">
            {navLink('/input', 'Input Form', ClipboardList)}
            {navLink('/reports', 'Reports', FileText)}
          </nav>

          {isAdmin && (
            <div className="mt-6">
              <h3 className="text-xs uppercase text-gray-400 tracking-wide mb-2">Admin</h3>
              <nav className="space-y-2">
                {navLink('/admin', 'User Approval', UserCircle, 'text-yellow-400')}
                {navLink('/admin-dashboard', 'Admin Dashboard', LayoutDashboard, 'text-yellow-400')}
              </nav>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-gray-400 text-sm">{displayName}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-blue-400 hover:text-white transition">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile BottomNav */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1c1f26] text-gray-300 flex md:hidden items-center justify-between gap-6 px-6 py-3 rounded-2xl shadow-xl z-50">
        <NavIcon icon={<ClipboardList size={20} />} href="/input" />
        <NavIcon icon={<Plus size={24} />} center href="/input" />
        <NavIcon icon={<Bell size={20} />} />
        <NavIcon icon={<User size={20} />} />
      </nav>
    </>
  );
}

function NavIcon({ icon, href = '#', center = false }) {
  return (
    <a
      href={href}
      className={`p-2 rounded-full flex items-center justify-center transition-all ${
        center ? 'bg-blue-500 text-white w-12 h-12 shadow-lg' : 'hover:text-white'
      }`}
    >
      {icon}
    </a>
  );
}