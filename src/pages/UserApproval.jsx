// src/pages/UserApproval.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';

export default function UserApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useAuthState(auth);

  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'users'));
    const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateField = async (id, updates) => {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, updates);
    fetchUsers();
  };

  const renderUser = (user) => (
    <div key={user.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[--bg] shadow p-4 rounded mb-4">
      <div className="mb-2 sm:mb-0">
        <div className="font-semibold">
  {user.name}
  {currentUser?.uid === user.id && (
    <span className="ml-2 text-xs text-blue-600 font-normal">(you)</span>
  )}
</div>
        <div className="text-sm text-gray-600">{user.email}</div>
        <div className="text-xs text-gray-500">Status: {user.approved ? '✅ Approved' : '⏳ Pending'}</div>
        <div className="text-xs text-gray-500">Role: {user.role || 'user'}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!user.approved && (
          <>
            <button onClick={() => updateField(user.id, { approved: true })} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Approve</button>
            <button onClick={() => updateField(user.id, { approved: false })} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Deny</button>
          </>
        )}
        {user.approved && (
          <button onClick={() => updateField(user.id, { approved: false })} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm">Revoke</button>
        )}

        {user.role !== 'admin' && (
          <button onClick={() => updateField(user.id, { role: 'admin' })} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">Make Admin</button>
        )}
        {user.role === 'admin' && (
          <button onClick={() => updateField(user.id, { role: 'user' })} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">Make User</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <>
          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            users.map(renderUser)
          )}
        </>
      )}
    </div>
  );
}