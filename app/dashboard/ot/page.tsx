'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import OtLogBook from '@/components/OtLogBook';
import { Loader2 } from 'lucide-react';

export default function OtDashboardPage() {
  const { data: _session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <main className="flex-1 p-4 md:p-8 w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            Overtime Logbook
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Track your overtime hours and sessions
          </p>
        </div>
        
        <OtLogBook />
      </div>
    </main>
  );
}
