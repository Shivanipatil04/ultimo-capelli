"use client";

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    instagram: 0,
    transformations: 0,
    services: 0
  });

  useEffect(() => {
    async function fetchData() {
      const [igRes, trRes, svRes] = await Promise.all([
        fetch('/api/gallery').then(r => r.json()),
        fetch('/api/transformations').then(r => r.json()),
        fetch('/api/services').then(r => r.json())
      ]);
      setStats({
        instagram: igRes.length || 0,
        transformations: trRes.length || 0,
        services: svRes.length || 0
      });
    }
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Instagram Videos</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.instagram}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Transformations</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.transformations}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Services</h3>
          <p className="text-4xl font-bold text-green-600">{stats.services}</p>
        </div>

      </div>
    </div>
  );
}
