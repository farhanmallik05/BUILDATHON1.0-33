import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Get current user profile from Firestore
export async function getUserProfile() {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const profileRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data();
    }
    return null;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
}

// Create or update user profile
export async function updateUserProfile(data) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user signed in');
    
    const profileRef = doc(db, 'users', user.uid);
    const updateData = {
      ...data,
      email: user.email,
      uid: user.uid,
      updatedAt: serverTimestamp()
    };
    
    // Check if profile exists
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      updateData.createdAt = serverTimestamp();
    }
    
    await setDoc(profileRef, updateData, { merge: true });
    return { success: true, data: updateData };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { success: false, error: err.message };
  }
}

// Initialize profile on signup (called after user creates account)
export async function initializeProfile(displayName, email) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user signed in');
    
    const profileRef = doc(db, 'users', user.uid);
    await setDoc(profileRef, {
      uid: user.uid,
      email: email,
      displayName: displayName || '',
      bio: '',
      skills: [],
      avatar: null,
      socialLinks: {
        twitter: '',
        github: '',
        linkedin: ''
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (err) {
    console.error('Error initializing profile:', err);
    return { success: false, error: err.message };
  }
}
