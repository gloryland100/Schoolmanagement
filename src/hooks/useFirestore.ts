import { useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  type QueryConstraint,
  onSnapshot,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";

// Generic CRUD hook
export function useFirestoreCollection<T extends Record<string, any>>(collectionName: string) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (constraints?: QueryConstraint[]) => {
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, collectionName);
      const q = constraints ? query(ref, ...constraints) : query(ref, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T & { id: string }));
      setData(items);
      return items;
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching ${collectionName}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const fetchByField = useCallback(async (field: string, value: any) => {
    setLoading(true);
    try {
      const q = query(collection(db, collectionName), where(field, "==", value), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T & { id: string }));
      setData(items);
      return items;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const getById = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as T & { id: string };
      }
      return null;
    } catch (err: any) {
      console.error(`Error getting ${collectionName} by id:`, err);
      return null;
    }
  }, [collectionName]);

  const create = useCallback(async (data: Record<string, any>, customId?: string) => {
    try {
      const timestamp = new Date().toISOString();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      let docRef;
      if (customId) {
        docRef = doc(db, collectionName, customId);
        await setDoc(docRef, docData);
      } else {
        docRef = await addDoc(collection(db, collectionName), docData);
      }

      toast.success("Created successfully");
      return { id: docRef.id, ...docData } as unknown as T & { id: string };
    } catch (err: any) {
      toast.error("Failed to create");
      console.error(`Error creating ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  const update = useCallback(async (id: string, data: Record<string, any>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Updated successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to update");
      console.error(`Error updating ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Deleted successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to delete");
      console.error(`Error deleting ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  const subscribe = useCallback((constraints?: QueryConstraint[], callback?: (items: (T & { id: string })[]) => void) => {
    const ref = collection(db, collectionName);
    const q = constraints ? query(ref, ...constraints) : query(ref, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T & { id: string }));
      setData(items);
      if (callback) callback(items);
    }, (err) => {
      console.error(`Subscription error for ${collectionName}:`, err);
    });
  }, [collectionName]);

  const batchCreate = useCallback(async (items: Array<Record<string, any>>) => {
    try {
      const batch = writeBatch(db);
      const timestamp = new Date().toISOString();
      const results: Array<T & { id: string }> = [];

      for (const item of items) {
        const docRef = doc(collection(db, collectionName));
        const docData = { ...item, createdAt: timestamp, updatedAt: timestamp };
        batch.set(docRef, docData);
        results.push({ ...docData, id: docRef.id } as unknown as T & { id: string });
      }

      await batch.commit();
      toast.success(`${items.length} items created successfully`);
      return results;
    } catch (err: any) {
      toast.error("Batch creation failed");
      console.error(`Error batch creating ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  return {
    data,
    loading,
    error,
    fetchAll,
    fetchByField,
    getById,
    create,
    update,
    remove,
    subscribe,
    batchCreate,
  };
}

export const useFirestore = useFirestoreCollection;

// Specialized hooks for each collection
export const useStudents = () => useFirestoreCollection<any>("students");
export const useTeachers = () => useFirestoreCollection<any>("teachers");
export const useResults = () => useFirestoreCollection<any>("results");
export const useMessages = () => useFirestoreCollection<any>("messages");
export const useAnnouncements = () => useFirestoreCollection<any>("announcements");
export const usePayments = () => useFirestoreCollection<any>("payments");
export const useReceipts = () => useFirestoreCollection<any>("receipts");
export const useTimetables = () => useFirestoreCollection<any>("timetables");
export const useSessions = () => useFirestoreCollection<any>("sessions");
export const useSettings = () => useFirestoreCollection<any>("settings");
