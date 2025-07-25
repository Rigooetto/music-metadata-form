import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      console.log('User created:', userCredential.user);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role: 'pending', // puedes cambiar a 'viewer' o lo que gustes luego
        createdAt: new Date()
      });

      console.log('User saved in Firestore');

      navigate('/input');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[--bg] text-[--text] transition-colors duration-300">
  <form
    onSubmit={handleRegister}
    className="bg-[--bg-card] text-[--text] p-8 rounded-lg shadow-md w-full max-w-sm border border-[--border] transition-all duration-300"
  >
    <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

    <input
      type="text"
      placeholder="Full Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full mb-4 p-2 rounded border border-[--border] bg-[--input-bg] text-[--text] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[--focus-ring] transition"
      required
    />

    <input
      type="email"
      placeholder="Email Address"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full mb-4 p-2 rounded border border-[--border] bg-[--input-bg] text-[--text] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[--focus-ring] transition"
      required
    />

    <input
      type="password"
      placeholder="Password (min 6 characters)"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full mb-4 p-2 rounded border border-[--border] bg-[--input-bg] text-[--text] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[--focus-ring] transition"
      required
    />

    {error && (
      <p className="text-red-600 text-sm mb-4">{error}</p>
    )}

    <button
      type="submit"
      className="w-full bg-[--accent] text-[--bg] dark:text-white py-2 rounded font-medium hover:opacity-90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[--focus-ring]"
    >
      Register
    </button>

    <p className="text-center text-sm mt-4 text-[--text-muted]">
      Already have an account?{' '}
      <a href="/login" className="text-[--accent] hover:underline">
        Log in
      </a>
    </p>
  </form>
</div>
  );
}