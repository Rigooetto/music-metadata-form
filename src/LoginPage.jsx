// src/LoginPage.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data().approved === true) {
        navigate('/input');
      } else {
        alert('Your account is not yet approved by an admin.');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[--bg] text-[--text] transition-colors duration-300">
  <form
    onSubmit={handleLogin}
    className="bg-[--bg-card] text-[--text] p-8 rounded-lg shadow-md w-full max-w-sm border border-[--border] transition-all duration-300"
  >
    <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full mb-4 p-2 rounded border border-[--border] bg-[--input-bg] text-[--text] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[--focus-ring] transition"
      required
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full mb-6 p-2 rounded border border-[--border] bg-[--input-bg] text-[--text] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[--focus-ring] transition"
      required
    />

    <button
      type="submit"
      className="w-full bg-[--accent] text-[--bg] dark:text-white py-2 rounded font-medium hover:opacity-90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[--focus-ring]"
    >
      Sign In
    </button>

    <p className="text-center mt-4 text-[--text-muted]">
      Don’t have an account?{' '}
      <a href="/register" className="text-[--accent] hover:underline">
        Register
      </a>
    </p>
  </form>
</div>
  );
}