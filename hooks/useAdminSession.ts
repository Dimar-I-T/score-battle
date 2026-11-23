'use client';

import { useCallback, useEffect, useState } from 'react';

interface Admin {
  username: string;
  role: string;
}

interface AdminSessionResult {
  admin: Admin | null;
  isLoading: boolean;
  error: string;
  refreshSession: () => Promise<void>;
}

export function useAdminSession(): AdminSessionResult {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const res = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setAdmin(null);
        throw new Error(result.message || 'Unauthorized');
      }

      setAdmin(result.data);
    } catch (err) {
      setAdmin(null);
      setError(
        err instanceof Error ? err.message : 'Failed to verify admin session'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return {
    admin,
    isLoading,
    error,
    refreshSession,
  };
}