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
