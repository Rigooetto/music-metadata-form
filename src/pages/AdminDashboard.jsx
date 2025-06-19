// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts/types';

const COLORS = ['#34D399', '#FBBF24']; // verde para approved, amarillo para pending

export default function AdminDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      let approved = 0;
      let pending = 0;

      snapshot.forEach((doc) => {
        const user = doc.data();
        if (user.approved) {
          approved++;
        } else {
          pending++;
        }
      });

      setData([
        { name: 'Approved', value: approved },
        { name: 'Pending', value: pending }
      ]);
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Status Overview</h2>
      <div className="w-full h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}