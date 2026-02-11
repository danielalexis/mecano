'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get user ID from Firebase on client side
    (async () => {
      const { auth } = await import('@/lib/firebase');
      setUserId(auth?.currentUser?.uid || 'UNKNOWN');
    })();
  }, []);

  const handleLogout = async () => {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-6 text-center">
      <div className="max-w-md w-full bg-brand-surface border border-brand-border p-8 rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20">
            <ShieldAlert className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <h1 className="text-3xl font-display text-white mb-2 tracking-wide">ACCESS PENDING</h1>
        
        <p className="text-gray-400 font-tech mb-8 leading-relaxed">
          Your account has been created but requires administrator approval. 
          <br/><br/>
          Please contact the shop owner to activate your access.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()} 
            variant="primary" 
            fullWidth
          >
            CHECK STATUS AGAIN
          </Button>
          
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            fullWidth
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" /> LOGOUT
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-brand-border text-xs font-tech text-gray-600">
          USER_ID: {mounted ? (userId || 'LOADING...') : 'LOADING...'}
        </div>
      </div>
    </div>
  );
}
