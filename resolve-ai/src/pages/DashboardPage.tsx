import React from 'react';


export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Dispute Dashboard</h1>
        <p className="mb-4">Track all your disputes and their statuses in real time.</p>
        {/* TODO: Add real dashboard logic here */}
        <div className="text-gray-500">No disputes to show yet.</div>
      </div>
    </div>
  );
}