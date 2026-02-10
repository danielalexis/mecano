'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in -> Go to login
        router.push('/login');
        return;
      }

      try {
        // Check user record in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // New user -> Create pending record
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName || 'Unknown',
            photoURL: user.photoURL || '',
            status: 'pending', // <--- Default status
            role: 'staff',
            createdAt: Timestamp.now(),
            lastLogin: Timestamp.now(),
          });
          router.push('/pending-approval');
        } else {
          // Existing user -> Check status
          const userData = userSnap.data();
          
          // Update last login
          setDoc(userRef, { lastLogin: Timestamp.now() }, { merge: true });

          if (userData.status === 'approved') {
            setAuthorized(true);
          } else {
            router.push('/pending-approval');
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // On error (e.g., network), maybe stay on loading or redirect
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-surface border-t-brand-orange rounded-full animate-spin" />
          <div className="text-brand-orange font-display tracking-widest animate-pulse">VERIFYING_CREDENTIALS...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Don't render dashboard content while redirecting
  }

  return <>{children}</>;
}
