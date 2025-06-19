import React from 'react';

export default function NotApprovedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-yellow-100 text-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-2xl font-bold text-yellow-700 mb-4">Account Pending Approval</h1>
        <p className="text-gray-700">
          Your account has been created but is not yet approved by the administrator.
          <br />
          Please wait for approval or contact support if needed.
        </p>
      </div>
    </div>
  );
}