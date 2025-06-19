import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [checking, setChecking] = useState(true);
  const [approved, setApproved] = useState(null);

  useEffect(() => {
    const checkApproval = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setApproved(data.approved === true);
          } else {
            setApproved(false);
          }
        } catch (err) {
          console.error('Error checking approval:', err);
          setApproved(false);
        }
      }
      setChecking(false);
    };

    checkApproval();
  }, [user]);

  if (loading || checking) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Checking access...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (approved === false) return <Navigate to="/not-approved" />;

  return children;
}