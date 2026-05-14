import { db, auth } from '../config/firebaseConfig';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, query, orderBy, where, setDoc } from 'firebase/firestore';

export const initDatabase = async () => {
  // Firestore is automatically initialized via firebaseConfig.js
  console.log('Firebase Firestore initialized.');
};

// Helper to get user's subcollection reference
const getRef = (colName) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated.");
  return collection(db, 'users', uid, colName);
};

// ─── Resource CRUD ─────────────────────────────────────────────────────────
export const addResource = async (r) => {
  const docRef = await addDoc(getRef('resources'), {
    title: r.title,
    link: r.link,
    category: r.category,
    tags: r.tags || '',
    is_important: r.isImportant ? 1 : 0,
    type: r.type || 'LINK',
    created_at: r.createdAt || Date.now()
  });
  return docRef.id;
};

export const getResourceById = async (id) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'resources', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

export const upsertResource = async (r) => {
  if (r.id) {
    await updateResource(r);
    return r.id;
  } else {
    return await addResource(r);
  }
};

export const getAllResources = async () => {
  const q = query(getRef('resources'), orderBy('is_important', 'desc'), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getResourcesByCategory = async (category) => {
  const q = query(getRef('resources'), where('category', '==', category), orderBy('is_important', 'desc'), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const searchResources = async (searchQuery) => {
  // Simple client-side search since Firestore doesn't natively support full-text search without extensions
  const all = await getAllResources();
  const lowerQuery = searchQuery.toLowerCase();
  return all.filter(r => 
    r.title.toLowerCase().includes(lowerQuery) || 
    r.category.toLowerCase().includes(lowerQuery) || 
    r.tags.toLowerCase().includes(lowerQuery)
  );
};

export const getResourceCategories = async () => {
  const all = await getAllResources();
  const cats = new Set(all.map(r => r.category));
  return Array.from(cats).sort();
};

export const updateResource = async (r) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'resources', r.id);
  await updateDoc(docRef, {
    title: r.title,
    link: r.link,
    category: r.category,
    tags: r.tags || '',
    is_important: r.isImportant ? 1 : 0,
    type: r.type || 'LINK',
    created_at: r.createdAt || Date.now()
  });
  return 1;
};

export const toggleResourceImportant = async (id, important) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'resources', id);
  await updateDoc(docRef, { is_important: important ? 1 : 0 });
  return 1;
};

export const deleteResource = async (id) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'resources', id);
  await deleteDoc(docRef);
  return 1;
};

// ─── Attendance CRUD ───────────────────────────────────────────────────────
export const upsertAttendance = async (a) => {
  // Use subject as the document ID so we can easily update existing ones
  const docRef = doc(db, 'users', auth.currentUser.uid, 'attendance', a.subject);
  await setDoc(docRef, {
    subject: a.subject,
    total_classes: a.totalClasses,
    attended_classes: a.attendedClasses
  }, { merge: true });
  return docRef.id;
};

export const getAllAttendance = async () => {
  const q = query(getRef('attendance'), orderBy('subject', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteAttendance = async (id) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'attendance', id);
  await deleteDoc(docRef);
  return 1;
};

// ─── Timetable CRUD ────────────────────────────────────────────────────────
export const addTimetable = async (t) => {
  const docRef = await addDoc(getRef('timetable'), {
    subject: t.subject,
    day: t.day,
    start_time: t.startTime,
    end_time: t.endTime,
    type: t.type
  });
  return docRef.id;
};

export const getTimetableByDay = async (day) => {
  const q = query(getRef('timetable'), where('day', '==', day));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Client-side sort by start_time
  return data.sort((a, b) => a.start_time.localeCompare(b.start_time));
};

export const deleteTimetable = async (id) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'timetable', id);
  await deleteDoc(docRef);
  return 1;
};

// ─── Tasks CRUD ────────────────────────────────────────────────────────────
export const addTask = async (title, desc, due, cat) => {
  const docRef = await addDoc(getRef('tasks'), {
    title: title,
    description: desc,
    due_date: due,
    category: cat,
    is_done: 0
  });
  return docRef.id;
};

export const getAllTasks = async () => {
  const q = query(getRef('tasks'), orderBy('is_done', 'asc'), orderBy('due_date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTaskStatus = async (id, done) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'tasks', id);
  await updateDoc(docRef, { is_done: done ? 1 : 0 });
  return 1;
};

export const deleteTask = async (id) => {
  const docRef = doc(db, 'users', auth.currentUser.uid, 'tasks', id);
  await deleteDoc(docRef);
  return 1;
};
