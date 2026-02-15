'use client';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export const useUserProfile = () => {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userDocRef);

  // Loading is true if auth is loading, or if we have a non-anonymous user but their profile is still loading.
  const isLoading = isAuthLoading || (!!user && !user.isAnonymous && isProfileLoading);
  
  return {
    user, // the auth user object
    userProfile, // the firestore user document
    isLoading,
    error,
    isAnonymous: user?.isAnonymous ?? false,
    role: user?.isAnonymous ? 'Guest' : userProfile?.role,
  };
};
