import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppSettings, Transaction } from '../types';

/**
 * Saves or updates basic user profile info in /users/{userId}
 */
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to the authenticated user's personal transactions collection
 */
export function subscribeToTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/transactions`;
  const txCollectionRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    txCollectionRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          type: data.type,
          amount: Number(data.amount) || 0,
          currency: data.currency || 'USD',
          categoryId: data.categoryId || data.category || 'other',
          date: data.date,
          time: data.time || '',
          note: data.note || '',
          paymentMethod: data.paymentMethod || 'cash',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      });
      // Sort newest first
      items.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Adds or updates a transaction in the user's Firestore collection
 */
export async function saveTransactionToFirestore(
  userId: string,
  transaction: Transaction
): Promise<void> {
  const path = `users/${userId}/transactions/${transaction.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transaction.id);
    const cleanPayload: Record<string, any> = {
      id: transaction.id,
      userId: userId,
      type: transaction.type,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      categoryId: transaction.categoryId,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    if (transaction.note) {
      cleanPayload.note = transaction.note.slice(0, 500);
    }
    if (transaction.time) {
      cleanPayload.time = transaction.time;
    }

    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a transaction from the user's Firestore collection
 */
export async function deleteTransactionFromFirestore(
  userId: string,
  transactionId: string
): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to the user's personal settings document
 */
export function subscribeToSettings(
  userId: string,
  onUpdate: (settings: Partial<AppSettings>) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/settings/current`;
  const docRef = doc(db, 'users', userId, 'settings', 'current');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          language: data.language,
          primaryCurrency: data.primaryCurrency,
          exchangeRate: Number(data.exchangeRate) || 4100,
          monthlyBudget: Number(data.monthlyBudget) || 0,
          theme: data.theme,
        });
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Saves user settings into /users/{userId}/settings/current
 */
export async function saveSettingsToFirestore(
  userId: string,
  settings: AppSettings
): Promise<void> {
  const path = `users/${userId}/settings/current`;
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'current');
    await setDoc(
      docRef,
      {
        userId: userId,
        language: settings.language,
        primaryCurrency: settings.primaryCurrency,
        exchangeRate: Number(settings.exchangeRate),
        monthlyBudget: Number(settings.monthlyBudget) || 0,
        theme: settings.theme,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Batch upload existing local transactions to Firestore when user connects
 */
export async function batchMigrateTransactions(
  userId: string,
  transactions: Transaction[]
): Promise<void> {
  if (transactions.length === 0) return;
  const path = `users/${userId}/transactions`;
  try {
    const batch = writeBatch(db);
    // Firestore batch limit is 500
    const limitedTxs = transactions.slice(0, 300);

    for (const tx of limitedTxs) {
      const docRef = doc(db, 'users', userId, 'transactions', tx.id);
      const cleanPayload: Record<string, any> = {
        id: tx.id,
        userId: userId,
        type: tx.type,
        amount: Number(tx.amount),
        currency: tx.currency,
        categoryId: tx.categoryId,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        createdAt: tx.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      if (tx.note) cleanPayload.note = tx.note.slice(0, 500);
      if (tx.time) cleanPayload.time = tx.time;
      batch.set(docRef, cleanPayload, { merge: true });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
