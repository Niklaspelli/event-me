import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Container, ListGroup, Spinner, Card } from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import SearchItem from "./SearchItem"; // Vi importerar rad-komponenten

const SearchResults = () => {
  const { user: currentUser } = useAuth() as any;
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(useLocation().search);
  const searchTerm = queryParams.get("q") || "";

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const lowSearch = searchTerm.toLowerCase();

        const q = query(
          usersRef,
          where("displayName_lowercase", ">=", lowSearch),
          where("displayName_lowercase", "<=", lowSearch + "\uf8ff"),
          limit(20),
        );

        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.id !== currentUser?.uid);

        setResults(users);
      } catch (err) {
        console.error("Sökfel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, currentUser?.uid]);

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Sökresultat</h2>
        <p className="text-muted small">
          Hittade {results.length} användare för "{searchTerm}"
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <ListGroup variant="flush">
            {results.length > 0 ? (
              results.map((u) => <SearchItem key={u.id} user={u} />)
            ) : (
              <div className="p-5 text-center text-muted bg-white">
                Inga användare matchade din sökning.
              </div>
            )}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
};

export default SearchResults;
