// src/pages/UserApproval.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'users'));
    const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPendingUsers(allUsers.filter(u => u.approved !== true));
    setApprovedUsers(allUsers.filter(u => u.approved === true));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateApproval = async (id, approve) => {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, { approved: approve });
    fetchUsers();
  };

  const renderUser = (user, actionLabel, action) => (
    <div key={user.id} className="flex justify-between items-center bg-white shadow p-4 rounded mb-2">
      <div>
        <div className="font-semibold">{user.name}</div>
        <div className="text-sm text-gray-600">{user.email}</div>
      </div>
      <button
        onClick={() => updateApproval(user.id, action)}
        className={`px-4 py-1 rounded text-white ${action ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
      >
        {actionLabel}
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Approval</h2>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Pending Users</h3>
            {pendingUsers.length === 0 ? <p className="text-gray-500">No pending users.</p> : pendingUsers.map(user => renderUser(user, 'Approve', true))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Approved Users</h3>
            {approvedUsers.length === 0 ? <p className="text-gray-500">No approved users.</p> : approvedUsers.map(user => renderUser(user, 'Revoke', false))}
          </div>
        </>
      )}
    </div>
  );
}