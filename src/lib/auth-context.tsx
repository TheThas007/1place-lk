"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  gender: "male" | "female" | "other";
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, gender?: "male" | "female") => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateGender: (gender: "male" | "female" | "other") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial local cache for instant render
    const cachedGender = localStorage.getItem("sm_user_gender") as "male" | "female" | "other" | null;
    if (cachedGender) setGender(cachedGender);

    let docUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }

      if (u) {
        // Subscribe to live profile changes
        docUnsub = onSnapshot(
          doc(db, "users", u.uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              setProfile(data);
              if (data.gender) {
                setGender(data.gender);
                localStorage.setItem("sm_user_gender", data.gender);
              }
            } else {
              setProfile({
                uid: u.uid,
                displayName: u.displayName || "User",
                email: u.email || "",
                gender: "male",
              });
            }
          },
          (err) => {
            console.warn("User profile fetch error:", err);
          }
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authUnsub();
      if (docUnsub) docUnsub();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem("sm_just_logged_in", "true");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-gender-prompt"));
      }, 100);
    }
  };

  const signUp = async (name: string, email: string, password: string, selectedGender?: "male" | "female") => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    if (selectedGender) {
      setGender(selectedGender);
      localStorage.setItem("sm_user_gender", selectedGender);
    }

    sessionStorage.setItem("sm_just_logged_in", "true");

    // Save user data to Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      displayName: name,
      email: email,
      ...(selectedGender ? { gender: selectedGender } : {}),
      createdAt: new Date().toISOString()
    });

    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-gender-prompt"));
      }, 100);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    sessionStorage.setItem("sm_just_logged_in", "true");
    
    // Save/update Google user data in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      displayName: cred.user.displayName || "Google User",
      email: cred.user.email || "",
      createdAt: new Date().toISOString()
    }, { merge: true });

    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-gender-prompt"));
      }, 100);
    }
  };

  const updateGender = async (newGender: "male" | "female" | "other") => {
    setGender(newGender);
    localStorage.setItem("sm_user_gender", newGender);

    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            gender: newGender,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Could not save gender to Firestore:", e);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, gender, loading, signIn, signUp, signInWithGoogle, updateGender, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
