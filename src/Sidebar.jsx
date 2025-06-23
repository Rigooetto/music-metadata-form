// src/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, FileText, ClipboardList, LayoutDashboard,
  ShieldCheck, UserCircle, Bell, Plus, User, Menu, ChevronLeft
} from 'lucide-react';

export default function Sidebar() {
  const [user] = useAuthState(auth);
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('input'); // nuevo estado para tab activo
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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
          isActive ? `${highlight} bg-blue-500 font-semibold` : 'text-gray-300 hover:bg-[#2a2e39] hover:text-[--text] dark:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        {expanded && <span className="text-sm">{label}</span>}
      </a>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ${expanded ? 'w-64' : 'w-20'} bg-[#1c1f26] text-[--text] dark:text-white flex-col justify-between min-h-screen px-4 py-6 rounded-r-2xl shadow-xl transition-all duration-300`}>
        <div>
          {/* Toggle Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-6 text-blue-400 hover:text-[--text] dark:text-white transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[--focus-ring]"
          >
            {expanded ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo (conditionally rendered) */}
          {expanded && (
            <div className="flex items-center gap-3 mb-8 text-blue-400 text-lg font-semibold">
              <ShieldCheck className="w-6 h-6" />
              LabelMind.ai
            </div>
          )}

          <nav className="space-y-2">
            {navLink('/input', 'Input Form', ClipboardList)}
            {navLink('/reports', 'Reports', FileText)}
          </nav>

          {isAdmin && (
            <div className="mt-6">
              {expanded && <h3 className="text-xs uppercase text-gray-400 tracking-wide mb-2">Admin</h3>}
              <nav className="space-y-2">
                {navLink('/admin', 'User Approval', UserCircle, 'text-yellow-400')}
                {navLink('/admin-dashboard', 'Admin Dashboard', LayoutDashboard, 'text-yellow-400')}
              </nav>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {expanded && <div className="text-gray-400 text-sm">{displayName}</div>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-blue-400 hover:text-[--text] dark:text-white transition">
            <LogOut size={18} />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile BottomNav */}
      <div className="fixed bottom-0 w-full bg-[--bg] border-t shadow-md flex justify-around py-2 md:hidden z-50">
        <NavIcon
          icon={<ClipboardList size={20} />}
          label="Input"
          active={activeTab === 'input'}
          onClick={() => {
            setActiveTab('input');
            navigate('/input');
          }}
        />
        <NavIcon
          icon={<Plus size={24} />}
          center
          onClick={() => {
            setActiveTab('add');
            navigate('/input');
          }}
        />
        <NavIcon
          icon={<Bell size={20} />}
          label="Alerts"
          active={activeTab === 'alerts'}
          onClick={() => setActiveTab('alerts')}
        />
        <NavIcon
          icon={<User size={20} />}
          label="User"
          active={activeTab === 'user'}
          onClick={() => setActiveTab('user')}
        />
      </div>
    </>
  );
}

function NavIcon({ icon, label, href = '#', center = false, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all ${
        center
          ? 'bg-[--accent] text-[--text] dark:text-white w-12 h-12 rounded-full -mt-6 shadow-lg'
          : 'text-xs text-gray-600'
      } ${active && !center ? 'text-[--accent] font-semibold' : ''}`}
    >
      {icon}
      {!center && label && <span className="text-[10px] mt-0.5">{label}</span>}
    </button>
  );
}