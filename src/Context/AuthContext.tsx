import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  FacebookAuthProvider,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
// VIKTIGT: Se till att dessa stigar stämmer med din filstruktur
import { auth, db } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithFacebook: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
      const provider = new FacebookAuthProvider();
      provider.addScope("public_profile");

      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      // 1. Hämta Access Token (för att låsa upp bilden)
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      // 2. Hämta Facebook-ID
      const facebookUid = loggedInUser.providerData.find(
        (p) => p.providerId === "facebook.com",
      )?.uid;

      let photoURL = loggedInUser.photoURL;

      // Om vi har ID och Token, bygg den "upplåsta" URL:en
      if (facebookUid && accessToken) {
        photoURL = `https://graph.facebook.com/${facebookUid}/picture?type=large&access_token=${accessToken}`;
      }

      console.log("Slutgiltig bild-URL:", photoURL);

      // 3. Spara eller uppdatera i Firestore
      const userRef = doc(db, "users", loggedInUser.uid);
      await setDoc(
        userRef,
        {
          uid: loggedInUser.uid,
          displayName: loggedInUser.displayName,
          displayName_lowercase: loggedInUser.displayName?.toLowerCase() || "",
          email: loggedInUser.email,
          photoURL: photoURL,
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      );

      return result;
    } catch (error) {
      console.error("Inloggningsfel:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithFacebook, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
// 4. Hooken som tar bort "undefined"-felet i resten av appen
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Här garanterar TS att context är AuthContextType
  return context;
};
