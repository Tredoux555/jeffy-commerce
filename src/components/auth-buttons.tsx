'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AuthButtons() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <div className="w-8 h-8" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/auth/profile">
          <button 
            title={user.email} 
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
          >
            <User className="h-5 w-5 text-white" />
          </button>
        </Link>
        <button 
          onClick={handleSignOut} 
          title="Sign out" 
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-5 w-5 text-white" />
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth/login">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200">
        <LogIn className="h-4 w-4 text-white" />
        <span className="hidden sm:inline text-sm font-medium text-white">Login</span>
      </button>
    </Link>
  );
}
