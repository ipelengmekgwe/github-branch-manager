'use client';

import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <Navigation />
      <Dashboard />
    </ProtectedRoute>
  );
}
