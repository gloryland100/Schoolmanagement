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
import { auth, db } from "@/firebase/config";
import { useStore } from "@/store/useStore";
import type { User, UserRole, Student, Teacher } from "@/types";
import toast from "react-hot-toast";

const schoolIdToEmail = (schoolId: string) => `${schoolId.toLowerCase()}@debestgloryland.edu.ng`;

export const useAuth = () => {
  const {
    currentUser,
    userRole,
    authLoading,
    setCurrentUser,
    setUserRole,
    setAuthLoading,
    setStudentProfile,
    setTeacherProfile,
    reset,
  } = useStore();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setStudentProfile(null);
        setTeacherProfile(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setCurrentUser({ ...userData, id: firebaseUser.uid });
        setUserRole(userData.role);

        // Load role-specific profile
        if (userData.role === "student") {
          await loadStudentProfile(firebaseUser.uid);
        } else if (userData.role === "teacher") {
          await loadTeacherProfile(firebaseUser.uid);
        }
      } else {
        // Create user document if it doesn't exist (for admin first login)
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
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error loading user data");
    } finally {
      setAuthLoading(false);
    }
  };

  const loadStudentProfile = async (userId: string) => {
    try {
      const q = query(collection(db, "students"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setStudentProfile({ ...doc.data(), id: doc.id } as Student);
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
    }
  };

  const loadTeacherProfile = async (userId: string) => {
    try {
      const q = query(collection(db, "teachers"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setTeacherProfile({ ...doc.data(), id: doc.id } as Teacher);
      }
    } catch (error) {
      console.error("Error loading teacher profile:", error);
    }
  };

  const login = async (schoolId: string, password: string) => {
    try {
      setAuthLoading(true);
      const email = schoolIdToEmail(schoolId);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await loadUserData(userCredential.user);
      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("Invalid School ID or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const createUser = async (
    schoolId: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: Partial<User>
  ) => {
    try {
      const email = schoolIdToEmail(schoolId);

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
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

      return { success: true, uid: firebaseUser.uid };
    } catch (error: any) {
      console.error("Create user error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("School ID already exists");
      } else {
        toast.error("Failed to create user");
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
