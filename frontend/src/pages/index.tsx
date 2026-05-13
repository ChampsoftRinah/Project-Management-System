import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/projects');
    } else {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
}
