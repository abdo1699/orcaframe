"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, requiredRole = 'admin' }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would check the user's role from your auth context/state
    const userRole = localStorage.getItem('userRole') || 'viewer';
    
    if (userRole !== requiredRole) {
      router.push('/dashboard');
    } else {
      setIsAuthorized(true);
    }
    
    setIsLoading(false);
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthorized ? children : null;
}
