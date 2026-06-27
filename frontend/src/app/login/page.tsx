'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/ui/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.sessionStorage.getItem('zuno:auth-token');
    if (token && token !== 'mock-token') {
      router.push('/');
    } else {
      // Try silent bootstrap login
      import('@/lib/api/auth').then(({ bootstrapAuth }) => {
        bootstrapAuth().then((ok) => {
          if (ok) {
            router.push('/');
          }
        });
      });
    }
  }, [router]);

  const handleAuthSuccess = (username: string) => {
    // Redirect to home page on successful authentication
    router.push('/');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#F5F7FB] px-4 py-8">
      {/* Background blobs for premium glassmorphism vibe */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-[#CAE8A3]/30 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-[#B4E5F5]/30 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-sm">
        {/* App Logo/Header */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#174f84] text-2xl font-black text-white shadow-[0_8px_16px_rgba(23,79,132,0.2)]">
            Z
          </div>
          <span className="text-sm font-bold tracking-widest text-[#174f84]/80 uppercase">Zuno Wallet</span>
        </div>

        {/* Auth form container */}
        <div className="overflow-hidden rounded-3xl bg-white/70 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-white/50">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
}
