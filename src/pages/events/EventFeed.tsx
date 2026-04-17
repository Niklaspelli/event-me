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

const EventFeed = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    if (!eventId) return;

    // Lyssnar specifikt på inlägg som tillhör detta eventId
    const q = query(
      collection(db, "events", eventId, "posts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [eventId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    try {
      await addDoc(collection(db, "events", eventId, "posts"), {
        text: newPost,
        uid: user.uid,
        displayName: user.displayName || "Anonym",
        photoURL: user.photoURL || "",
        likes: [],
        createdAt: serverTimestamp(),
      });
      setNewPost("");
    } catch (error) {
      console.error("Kunde inte posta inlägg:", error);
    }
  };

  const handleLike = async (postId: string, likes: string[]) => {
    if (!user) return;
    const postRef = doc(db, "events", eventId, "posts", postId);
    const isLiked = likes?.includes(user.uid);

    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  return (
    <div className="mt-4">
      <h4 className="text-white mb-3">Eventvägg</h4>

      <Card className="mb-4 shadow-sm border-0 bg-dark border border-secondary">
        <Card.Body>
          <Form onSubmit={handlePost}>
            <InputGroup>
              <Form.Control
                className="bg-dark text-white border-secondary"
                placeholder="Skriv något till gruppen..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Posta
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {posts.length === 0 && (
        <p className="text-muted text-center">
          Inga inlägg än. Bli den första!
        </p>
      )}

      {posts.map((post) => (
        <Card
          key={post.id}
          className="mb-3 shadow-sm border-0 bg-dark text-white border border-secondary"
        >
          <Card.Body>
            <div className="d-flex align-items-center mb-2">
              <img
                src={post.photoURL || "https://via.placeholder.com/40"}
                alt="Profil"
                className="rounded-circle me-2"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div>
                <h6 className="mb-0">{post.displayName}</h6>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString("sv-SE")
                    : "Laddar..."}
                </small>
              </div>
            </div>
            <p className="my-3">{post.text}</p>
            <div className="d-flex gap-3 border-top pt-2 border-secondary">
              <Button
                variant={
                  post.likes?.includes(user?.uid) ? "primary" : "outline-light"
                }
                size="sm"
                className="rounded-pill"
                onClick={() => handleLike(post.id, post.likes)}
              >
                👍 {post.likes?.length || 0}
              </Button>
              <Button
                variant="outline-light"
                size="sm"
                className="rounded-pill"
              >
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
