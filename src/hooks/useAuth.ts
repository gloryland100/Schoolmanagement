import { useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db, secondaryAuth } from "@/firebase/config";
import { useStore } from "@/store/useStore";
import type { User, UserRole, Student, Teacher } from "@/types";
import toast from "react-hot-toast";

// Accepts schoolId (e.g. "STU001") or a full email address.
const toEmail = (input: string) =>
  input.includes("@")
    ? input.toLowerCase()
    : `${input.toLowerCase()}@debestgloryland.edu.ng`;

// Standalone function — uses Zustand's getState() so it can be called outside hooks.
async function fetchUserData(firebaseUser: FirebaseUser) {
  const { setCurrentUser, setUserRole, setStudentProfile, setTeacherProfile, setAuthLoading } =
    useStore.getState();
  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      setCurrentUser({ ...userData, id: firebaseUser.uid });
      setUserRole(userData.role);

      if (userData.role === "student") {
        const q = query(collection(db, "students"), where("userId", "==", firebaseUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setStudentProfile({ ...snap.docs[0].data(), id: snap.docs[0].id } as Student);
        }
      } else if (userData.role === "teacher") {
        const q = query(collection(db, "teachers"), where("userId", "==", firebaseUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTeacherProfile({ ...snap.docs[0].data(), id: snap.docs[0].id } as Teacher);
        }
      }
    } else {
      // First-time admin setup: auto-create the Firestore user document.
      const newUser: Omit<User, "id"> = {
        schoolId: firebaseUser.email?.split("@")[0] || "admin",
        role: "admin",
        name: firebaseUser.displayName || "Administrator",
        email: firebaseUser.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      setCurrentUser({ ...newUser, id: firebaseUser.uid });
      setUserRole("admin");
    }
  } catch (error: any) {
    console.error("Error loading user data:", error);
    const msg =
      error?.code === "permission-denied"
        ? "Firestore permission denied. Check your security rules."
        : "Error loading your profile. Please try again.";
    toast.error(msg);
  } finally {
    setAuthLoading(false);
  }
}

/**
 * Call this ONCE at the app root (App.tsx) to initialize the Firebase auth
 * state listener for the entire application lifetime.
 */
export const useAuthInit = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        useStore.getState().reset();
      }
    });
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useAuth = () => {
  const { currentUser, userRole, authLoading, setAuthLoading, reset } = useStore();

  /**
   * Sign in with a school ID or full email address.
   * The onAuthStateChanged listener (set up by useAuthInit) handles loading
   * the user profile and setting authLoading back to false on success.
   */
  const login = async (schoolId: string, password: string): Promise<boolean> => {
    try {
      setAuthLoading(true);
      const email = toEmail(schoolId);
      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      if (
        ["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"].includes(
          error.code
        )
      ) {
        toast.error("Invalid School ID or password. Check your credentials.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Please try again later.");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Check your internet connection.");
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
      setAuthLoading(false);
      return false;
    }
  };

  /**
   * Create a new Firebase Auth user + Firestore document WITHOUT signing out
   * the current admin session (uses a secondary Firebase app instance).
   */
  const createUser = async (
    schoolId: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: Partial<User>
  ): Promise<{ success: boolean; uid?: string; error?: string }> => {
    try {
      const email = toEmail(schoolId);

      // secondaryAuth keeps the primary auth session (admin) intact.
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const firebaseUser = userCredential.user;


      await updateProfile(firebaseUser, { displayName: name });


      const userData: Omit<User, "id"> = {
        schoolId,
        role,
        name,
        email,
        ...additionalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // Clean up the secondary auth session — admin stays logged in via primary auth.
      await signOut(secondaryAuth);

      return { success: true, uid: firebaseUser.uid };
    } catch (error: any) {
      console.error("Create user error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("School ID already in use");
      } else {
        toast.error(`Failed to create user: ${error.message}`);
      }
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      reset();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return {
    currentUser,
    userRole,
    authLoading,
    login,
    createUser,
    logout,
    loadUserData,
  };
};

export default useAuth;
