'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { usuario, cargando } = useAuth();

  useEffect(() => {
    if (!cargando) {
      if (usuario) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [usuario, cargando, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-400">Cargando...</div>
    </div>
  );
}
