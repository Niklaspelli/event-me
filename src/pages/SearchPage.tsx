/* import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Container, Button, ListGroup, Image, Spinner } from "react-bootstrap";
import { useAuth } from "../Context/AuthContext";

const SearchPage = () => {
  const { user: currentUser } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Hämta söksträngen från URL:en (?q=namn)
  const queryParams = new URLSearchParams(useLocation().search);
  const searchTerm = queryParams.get("q") || "";

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm) return;
      setLoading(true);

      try {
        const usersRef = collection(db, "users");
        const lowSearch = searchTerm.toLowerCase();

        // Firestore-trick för att söka på namn som börjar på sökordet
        const q = query(
          usersRef,
          // Vi söker nu i det fältet som bara har små bokstäver
          where("displayName_lowercase", ">=", lowSearch),
          where("displayName_lowercase", "<=", lowSearch + "\uf8ff"),
          limit(10),
        );
        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          // Filtrera bort dig själv från sökresultatet
          .filter((u) => u.id !== currentUser?.uid);

        setResults(users);
      } catch (err) {
        console.error("Sökfel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, currentUser]);

  const sendFriendRequest = async (targetUser: any) => {
    if (!currentUser) return;

    try {
      // Vi skapar ett unikt ID för förfrågan (t.ex. "minID_dinID")
      // för att undvika dubbla förfrågningar
      const requestId = `${currentUser.uid}_${targetUser.id}`;

      await setDoc(doc(db, "friendRequests", requestId), {
        fromId: currentUser.uid,
        fromName: currentUser.displayName,
        fromPhoto: currentUser.photoURL,
        toId: targetUser.uid,
        status: "pending", // Väntar på svar
        timestamp: serverTimestamp(),
      });

      alert(`Vänförfrågan skickad till ${targetUser.displayName}!`);
    } catch (err) {
      console.error("Kunde inte skicka förfrågan:", err);
    }
  };

  return (
    <Container className="py-4 text-black">
      <h3>Sökresultat för "{searchTerm}"</h3>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <ListGroup className="mt-4 shadow">
          {results.length > 0 ? (
            results.map((u) => (
              <ListGroup.Item
                key={u.id}
                className="bg-white text-white border-secondary d-flex align-items-center justify-content-between p-3"
              >
                <div className="d-flex align-items-center">
                  <Image
                    src={u.photoURL || "https://via.placeholder.com/50"}
                    roundedCircle
                    className="me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <h6 className="mb-0 text-black">{u.displayName}</h6>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill"
                  onClick={() => sendFriendRequest(u)}
                >
                  Lägg till vän
                </Button>
              </ListGroup.Item>
            ))
          ) : (
            <p className="mt-3 text-black">Inga användare hittades.</p>
          )}
        </ListGroup>
      )}
    </Container>
  );
};

export default SearchPage;
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Container, Button, ListGroup, Image, Spinner } from "react-bootstrap";
import { useAuth } from "../Context/AuthContext";
import SuccessDialog from "../components/SuccessDialog";

const SearchPage = () => {
  const { user: currentUser } = useAuth() as any;
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [targetName, setTargetName] = useState("");

  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const queryParams = new URLSearchParams(useLocation().search);
  const searchTerm = queryParams.get("q") || "";

  // Kombinerad useEffect för att hämta ALLT vid sökning eller profiländring
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser || !searchTerm) {
        setResults([]);
        return;
      }

      setLoading(true);
      setShowSuccess(false); // Stäng eventuell gammal dialog vid ny sökning

      try {
        // 1. Hämta befintliga vänner
        const friendsRef = collection(db, "users", currentUser.uid, "friends");
        const friendsSnap = await getDocs(friendsRef);
        setFriendIds(friendsSnap.docs.map((doc) => doc.id));

        // 2. Hämta pending förfrågningar
        const requestsRef = collection(db, "friendRequests");
        const qReq = query(
          requestsRef,
          where("fromId", "==", currentUser.uid),
          where("status", "==", "pending"),
        );
        const reqSnap = await getDocs(qReq);
        setPendingIds(reqSnap.docs.map((doc) => doc.data().toId));

        // 3. Hämta sökresultat
        const usersRef = collection(db, "users");
        const lowSearch = searchTerm.toLowerCase();
        const qUsers = query(
          usersRef,
          where("displayName_lowercase", ">=", lowSearch),
          where("displayName_lowercase", "<=", lowSearch + "\uf8ff"),
          limit(10),
        );

        const userSnap = await getDocs(qUsers);
        const users = userSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.id !== currentUser?.uid);

        setResults(users);
      } catch (err) {
        console.error("Datahämtningsfel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [searchTerm, currentUser]);

  const sendFriendRequest = async (targetUser: any) => {
    if (!currentUser) return;

    try {
      const requestId = `${currentUser.uid}_${targetUser.id}`;

      // Spara förfrågan i Firestore
      await setDoc(doc(db, "friendRequests", requestId), {
        fromId: currentUser.uid,
        fromName: currentUser.displayName,
        fromPhoto: currentUser.photoURL,
        toId: targetUser.id,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      // Uppdatera lokalt state omedelbart så knappen ändras
      setPendingIds((prev) => [...prev, targetUser.id]);
      setTargetName(targetUser.displayName);
      setShowSuccess(true);
    } catch (err) {
      console.error("Kunde inte skicka förfrågan:", err);
      alert("Ett fel uppstod när förfrågan skulle skickas.");
    }
  };

  return (
    <Container className="py-4 text-black">
      <h3 className="fw-bold">Sökresultat för "{searchTerm}"</h3>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <ListGroup className="mt-4 shadow-sm">
          {results.length > 0 ? (
            results.map((u) => {
              const isFriend = friendIds.includes(u.id);
              const isPending = pendingIds.includes(u.id);

              return (
                <ListGroup.Item
                  key={u.id}
                  className="d-flex justify-content-between align-items-center p-3 bg-white"
                >
                  <div className="d-flex align-items-center">
                    <Image
                      src={u.photoURL || "https://via.placeholder.com/50"}
                      roundedCircle
                      width={50}
                      height={50}
                      className="me-3"
                      style={{ objectFit: "cover" }}
                    />
                    <h6 className="mb-0 text-dark fw-semibold">
                      {u.displayName}
                    </h6>
                  </div>

                  <div>
                    {isFriend ? (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled
                        className="rounded-pill px-3"
                      >
                        Ni är vänner
                      </Button>
                    ) : isPending ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="rounded-pill px-3"
                      >
                        Förfrågan skickad
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => sendFriendRequest(u)}
                      >
                        Lägg till vän
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })
          ) : (
            <p className="mt-3 text-muted">Inga användare hittades.</p>
          )}
        </ListGroup>
      )}

      {showSuccess && targetName && (
        <SuccessDialog
          show={showSuccess}
          onHide={() => setShowSuccess(false)}
          message={`Vänförfrågan skickad till ${targetName}!`}
        />
      )}
    </Container>
  );
};

export default SearchPage;
