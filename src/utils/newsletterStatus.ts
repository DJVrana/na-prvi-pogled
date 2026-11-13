import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface NewsletterCheckResult {
  isSubscribed: boolean;
  data?: any;
}

/**
 * Provjerava nalazi li se zadani e-mail već u kolekciji newsletter_subscribers i je li aktivan.
 */
export async function checkNewsletterSubscription(email: string): Promise<NewsletterCheckResult> {
  if (!email || !email.trim()) {
    return { isSubscribed: false };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailDocId = cleanEmail.replace(/[^a-zA-Z0-9_.-]/g, '_');

  try {
    // 1. Izravni dohvat po ID-u dokumenta (standardizirani hash/key maila)
    const docRef = doc(db, 'newsletter_subscribers', emailDocId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.active !== false) {
        return { isSubscribed: true, data };
      }
    }

    // 2. Rezervni query po polju email
    const q = query(
      collection(db, 'newsletter_subscribers'),
      where('email', '==', cleanEmail)
    );
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      const activeDoc = qSnap.docs.find(d => d.data()?.active !== false);
      if (activeDoc) {
        return { isSubscribed: true, data: activeDoc.data() };
      }
    }
  } catch (err) {
    console.error('Greška pri provjeri pretplate na newsletter:', err);
  }

  return { isSubscribed: false };
}

