import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  User,
  ProctoringSession,
  Alert,
  ProctoringEvent,
  Exam,
  ProctoringResult
} from '../types/database';

// Users Collection
export const usersCollection = collection(db, 'users');

export const createUser = async (
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string
): Promise<string> => {
  // If a Firebase UID is provided, persist the user document under that UID
  if (userId) {
    const docRef = doc(usersCollection, userId);
    await setDoc(docRef, {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return userId;
  }

  const docRef = await addDoc(usersCollection, {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(usersCollection, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as User;
  }
  return null;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  const docRef = doc(usersCollection, userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Sessions Collection
export const sessionsCollection = collection(db, 'sessions');

export const createSession = async (sessionData: Omit<ProctoringSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(sessionsCollection, {
    ...sessionData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getSession = async (sessionId: string): Promise<ProctoringSession | null> => {
  const docRef = doc(sessionsCollection, sessionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      startTime: data.startTime?.toDate(),
      endTime: data.endTime?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as ProctoringSession;
  }
  return null;
};

export const updateSession = async (sessionId: string, updates: Partial<ProctoringSession>): Promise<void> => {
  const docRef = doc(sessionsCollection, sessionId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const getActiveSessions = async (): Promise<ProctoringSession[]> => {
  const q = query(
    sessionsCollection,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate(),
    endTime: doc.data().endTime?.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as ProctoringSession[];
};

// Alerts Collection
export const alertsCollection = collection(db, 'alerts');

export const createAlert = async (alertData: Omit<Alert, 'id'>): Promise<string> => {
  const docRef = await addDoc(alertsCollection, {
    ...alertData,
    timestamp: Timestamp.now()
  });
  return docRef.id;
};

export const getSessionAlerts = async (sessionId: string): Promise<Alert[]> => {
  const q = query(
    alertsCollection,
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate()
  })) as Alert[];
};

// Events Collection
export const eventsCollection = collection(db, 'events');

export const createEvent = async (eventData: Omit<ProctoringEvent, 'id'>): Promise<string> => {
  const docRef = await addDoc(eventsCollection, {
    ...eventData,
    timestamp: Timestamp.now()
  });
  return docRef.id;
};

// Exams Collection
export const examsCollection = collection(db, 'exams');

export const createExam = async (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(examsCollection, {
    ...examData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getExams = async (): Promise<Exam[]> => {
  const q = query(examsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as Exam[];
};

// Results Collection
export const resultsCollection = collection(db, 'results');

export const createResult = async (resultData: ProctoringResult): Promise<string> => {
  const docRef = await addDoc(resultsCollection, {
    ...resultData,
    reportGeneratedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getSessionResult = async (sessionId: string): Promise<ProctoringResult | null> => {
  const q = query(resultsCollection, where('sessionId', '==', sessionId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      reportGeneratedAt: doc.data().reportGeneratedAt.toDate()
    } as ProctoringResult;
  }
  return null;
};

// Real-time listeners
export const subscribeToSessionAlerts = (sessionId: string, callback: (alerts: Alert[]) => void) => {
  const q = query(
    alertsCollection,
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'desc'),
    limit(10)
  );

  return onSnapshot(q, (querySnapshot) => {
    const alerts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as Alert[];
    callback(alerts);
  });
};

export const subscribeToSession = (sessionId: string, callback: (session: ProctoringSession) => void) => {
  const docRef = doc(sessionsCollection, sessionId);

  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const session: ProctoringSession = {
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate(),
        endTime: data.endTime?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as ProctoringSession;
      callback(session);
    }
  });
};
