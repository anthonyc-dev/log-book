'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import LogBook from '@/components/LogBook';
import UserButton from '@/components/auth/user-button';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Log Book
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Track your daily work sessions and tasks
            </p>
          </div>
          
          {/* User Menu */}
          {session?.user && (
            <UserButton user={session.user} />
          )}
        </div>
        
        <LogBook />
      </div>
    </main>
  );
}
