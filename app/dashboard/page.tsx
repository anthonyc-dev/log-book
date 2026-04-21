'use client';

import LogBook from '@/components/LogBook';

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 md:p-8 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            Log Book
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Track your daily work sessions and tasks
          </p>
        </div>
        
        <LogBook />
      </div>
    </main>
  );
}
