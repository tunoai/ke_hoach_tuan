import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";
import type { Task, IdeaNote, Category } from "./types";

const TASKS_COLLECTION = "tasks";
const IDEAS_COLLECTION = "ideas";
const CATEGORIES_COLLECTION = "categories";

// --- Tasks ---
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, TASKS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  });
};

export const saveTaskToFirebase = async (task: Task) => {
  await setDoc(doc(db, TASKS_COLLECTION, task.id), task);
};

export const deleteTaskFromFirebase = async (taskId: string) => {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
};

// --- Ideas ---
export const subscribeToIdeas = (callback: (ideas: IdeaNote[]) => void) => {
  const q = query(collection(db, IDEAS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IdeaNote));
    callback(ideas);
  });
};

export const saveIdeaToFirebase = async (idea: IdeaNote) => {
  await setDoc(doc(db, IDEAS_COLLECTION, idea.id), idea);
};

export const deleteIdeaFromFirebase = async (ideaId: string) => {
  await deleteDoc(doc(db, IDEAS_COLLECTION, ideaId));
};

// --- Categories ---
export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  return onSnapshot(collection(db, CATEGORIES_COLLECTION), (snapshot) => {
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    callback(categories);
  });
};

export const saveCategoryToFirebase = async (category: Category) => {
  await setDoc(doc(db, CATEGORIES_COLLECTION, category.id), category);
};

export const deleteCategoryFromFirebase = async (categoryId: string) => {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
};
