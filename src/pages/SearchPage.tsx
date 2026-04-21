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

        // Firestore-trick för att söka på namn som börjar på sökordet
        const q = query(
          usersRef,
          where("displayName", ">=", searchTerm),
          where("displayName", "<=", searchTerm + "\uf8ff"),
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

  const addFriend = async (targetUser: any) => {
    if (!currentUser) return;

    try {
      // Skapa en vänförfrågan eller lägg till direkt (här kör vi direkt för enkelhet)
      // Vi sparar vännen under den inloggade användarens 'friends' sub-collection
      await setDoc(
        doc(db, "users", currentUser.uid, "friends", targetUser.id),
        {
          displayName: targetUser.displayName,
          photoURL: targetUser.photoURL,
          addedAt: serverTimestamp(),
        },
      );

      alert(`${targetUser.displayName} har lagts till i din vänlista!`);
    } catch (err) {
      console.error("Kunde inte lägga till vän:", err);
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
                  onClick={() => addFriend(u)}
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
