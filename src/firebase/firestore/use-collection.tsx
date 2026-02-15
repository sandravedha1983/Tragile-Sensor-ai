'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
  getFirestore,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean }) | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsubSnapshot: (() => void) | null = null;
    let unsubAuth: (() => void) | null = null;

    const startSnapshot = () => {
      if (unsubSnapshot) return;

      unsubSnapshot = onSnapshot(
        memoizedTargetRefOrQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const results: ResultItemType[] = [];
          for (const doc of snapshot.docs) {
            results.push({ ...(doc.data() as T), id: doc.id });
          }
          setData(results);
          setError(null);
          setIsLoading(false);
        },
        (error: FirestoreError) => {
          let contextualError: any = error;

          if (error.code === 'permission-denied') {
            let path = 'unknown';
            try {
              path = memoizedTargetRefOrQuery.type === 'collection'
                ? (memoizedTargetRefOrQuery as CollectionReference).path
                : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();
            } catch (e) {
              console.error('Failed to extract path for permission error:', e);
            }

            contextualError = new FirestorePermissionError({
              operation: 'list',
              path,
            });
            // Ensure the code is preserved for diagnostic UI
            contextualError.code = error.code;
            errorEmitter.emit('permission-error', contextualError);
          } else {
            console.error('Firestore collection error:', error);
          }

          setError(contextualError);
          setData(null);
          setIsLoading(false);
        }
      );
    };

    const auth = getAuth();

    // Listen for auth changes to terminate snapshots on logout
    unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        startSnapshot();
      } else {
        // User logged out - terminate active listeners immediately to avoid permission errors
        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }
        if (isMounted) {
          setData(null);
          setError(null);
          setIsLoading(false);
        }
      }
    });

    // Initial check
    if (auth.currentUser) {
      startSnapshot();
    } else {
      // Safety timeout: if auth doesn't settle in 2s, check if we can start anyway (public data)
      const timer = setTimeout(() => {
        if (!unsubSnapshot && isMounted) {
          startSnapshot();
        }
      }, 2000);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (unsubAuth) unsubAuth();
        if (unsubSnapshot) unsubSnapshot();
      };
    }

    return () => {
      isMounted = false;
      if (unsubAuth) unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [memoizedTargetRefOrQuery]);
  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }
  return { data, isLoading, error };
}