'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, Loader2, Activity } from 'lucide-react';

interface UserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserButton({ user }: UserButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/login' });
  };

  const handleActivity = () => {
    setIsOpen(false);
    router.push('/dashboard/activity');
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 transition-all duration-200"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-xs font-bold text-zinc-900">
          {initials}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-zinc-100 truncate max-w-[120px]">
            {user.name || 'User'}
          </p>
          <p className="text-xs text-zinc-500 truncate max-w-[120px]">
            {user.email}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 py-2 bg-zinc-800/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info in Dropdown */}
            <div className="px-3 py-2 border-b border-zinc-700/50 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-sm font-bold text-zinc-900">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate max-w-[180px]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Button */}
            <button
              onClick={handleActivity}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-200 hover:bg-orange-500/10 hover:text-orange-400 transition-colors"
            >
              <Activity className="w-4 h-4" />
              Activity
            </button>

            <div className="my-1 h-px bg-zinc-700/50" />

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
