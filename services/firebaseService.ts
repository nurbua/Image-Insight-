import { db, storage } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { AnalysisData, AnalysisResult } from '../types';

/**
 * Sauvegarde le résultat d'une analyse dans Firebase.
 * @param userId L'ID de l'utilisateur.
 * @param file Le fichier image analysé.
 * @param data Les données d'analyse générées par Gemini.
 */
export const saveAnalysisResult = async (userId: string, file: File, data: AnalysisData): Promise<void> => {
  try {
    // 1. Téléverser l'image sur Firebase Storage
    const storageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // 2. Sauvegarder les métadonnées et l'URL de l'image dans Firestore
    const docRef = await addDoc(collection(db, 'analyses'), {
      userId,
      imageUrl,
      fileName: file.name,
      ...data,
      createdAt: serverTimestamp(),
    });

    console.log("Analyse sauvegardée avec l'ID: ", docRef.id);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'analyse: ", error);
    throw new Error("Impossible de sauvegarder le résultat de l'analyse.");
  }
};

/**
 * Récupère l'historique des analyses pour un utilisateur.
 * @param userId L'ID de l'utilisateur.
 * @returns Une promesse qui se résout avec un tableau de résultats d'analyse.
 */
export const getAnalysisHistory = async (userId: string): Promise<AnalysisResult[]> => {
    try {
        const q = query(
            collection(db, 'analyses'), 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const history: AnalysisResult[] = [];
        querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() } as AnalysisResult);
        });
        
        return history;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique: ", error);
        throw new Error("Impossible de récupérer l'historique des analyses.");
    }
}
