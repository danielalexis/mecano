import { useState, useEffect } from 'react';
import { DocumentData, QueryConstraint } from 'firebase/firestore';

export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    (async () => {
      // Dynamic import to prevent Firebase from loading in worker
      const { collection, query, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const q = query(collection(db, collectionName), ...constraints);

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore Error:", err);
          setError(err);
          setLoading(false);
        }
      );
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}
