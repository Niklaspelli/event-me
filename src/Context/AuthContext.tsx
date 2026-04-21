import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, facebookProvider } from "../firebase"; // Vi hämtar db och providern härifrån
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  FacebookAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithFacebook = async () => {
    try {
      // 1. Öppna Facebook-popupen
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      // 2. Spara eller uppdatera användaren i Firestore
      // Detta skapar collectionen "users" automatiskt om den inte finns!
      const userRef = doc(db, "users", loggedInUser.uid);

      await setDoc(
        userRef,
        {
          uid: loggedInUser.uid,
          displayName: loggedInUser.displayName,
          displayName_lowercase: loggedInUser.displayName
            ? loggedInUser.displayName.toLowerCase()
            : "",
          email: loggedInUser.email,
          photoURL: loggedInUser.photoURL,
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      );

      console.log("Användare sparad i databasen!");
      return result;
    } catch (error) {
      console.error("Inloggningsfel:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return (
    // Vi lägger till loading i value så att LoginView kan visa en spinner
    <AuthContext.Provider value={{ user, loading, loginWithFacebook, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
