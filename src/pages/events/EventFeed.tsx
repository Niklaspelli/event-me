import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../Context/AuthContext";
import { Card, Button, Form, InputGroup } from "react-bootstrap";

// ... (behåll dina importer)

const EventFeed = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    if (!eventId) return;
    const q = query(
      collection(db, "events", eventId, "posts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [eventId]);

  // FIX 1: Hantera formuläret korrekt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stoppa sidan från att laddas om

    if (!user || !eventId || !newPost.trim()) return;

    try {
      const postsRef = collection(db, "events", eventId, "posts");
      await addDoc(postsRef, {
        text: newPost, // Använd statet newPost här
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || "Anonym",
        photoURL: user.photoURL || "/default-avatar.png",
        likes: [], // FIX 2: Initiera likes som en tom array så .includes() inte kraschar senare
      });

      setNewPost(""); // FIX 3: Töm textfältet efter lyckad post
    } catch (err) {
      console.error("Kunde inte spara inlägg:", err);
    }
  };

  const handleLike = async (postId: string, likes: string[] = []) => {
    if (!user) return;
    const postRef = doc(db, "events", eventId, "posts", postId);

    // Använd tom array som fallback om likes inte finns än
    const currentLikes = likes || [];
    const isLiked = currentLikes.includes(user.uid);

    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  return (
    <div className="mt-4">
      <h5 className="fw-bold mb-4">Händelsevägg</h5>

      <Card className="mb-4 shadow-sm border-0 bg-white border border-secondary">
        <Card.Body>
          {/* FIX 4: Koppla till handleSubmit */}
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                className="text-black border-secondary"
                placeholder="Skriv något till gruppen..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <Button
                variant="primary"
                type="submit"
                disabled={!newPost.trim()}
              >
                Posta
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* ... resten av din render-kod är bra! */}
      {posts.length === 0 && (
        <p className="text-muted text-center py-4">
          Inga inlägg än. Bli den första!
        </p>
      )}

      {posts.map((post) => (
        <Card
          key={post.id}
          className="mb-3 shadow-sm border-0  text-black border border-secondary"
        >
          <Card.Body>
            <div className="d-flex align-items-center mb-2">
              <img
                src={post.photoURL || "/default-avatar.png"}
                alt="Profil"
                className="rounded-circle me-2"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div>
                <h6 className="mb-0">{post.displayName}</h6>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString("sv-SE")
                    : "Just nu..."}
                </small>
              </div>
            </div>
            <p className="my-3">{post.text}</p>
            <div className="d-flex gap-3 border-top pt-2 border-secondary">
              <Button
                variant={
                  post.likes?.includes(user?.uid) ? "primary" : "outline-dark"
                }
                size="sm"
                className="rounded-pill"
                onClick={() => handleLike(post.id, post.likes)}
              >
                👍 {post.likes?.length || 0}
              </Button>
              <Button variant="outline-dark" size="sm" className="rounded-pill">
                💬 Svara
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default EventFeed;
