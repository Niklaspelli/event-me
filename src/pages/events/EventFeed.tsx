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

const EventFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  // 1. Lyssna på inlägg i REALTID
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Skapa nytt inlägg
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    await addDoc(collection(db, "posts"), {
      text: newPost,
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      likes: [],
      createdAt: serverTimestamp(),
    });
    setNewPost("");
  };

  // 3. Like-funktion
  const handleLike = async (postId, likes) => {
    const postRef = doc(db, "posts", postId);
    const isLiked = likes.includes(user.uid);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  return (
    <div className="mt-4">
      {/* Skriv nytt inlägg */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={handlePost}>
            <InputGroup>
              <Form.Control
                placeholder="Vad händer?"
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

      {/* Feed-listan */}
      {posts.map((post) => (
        <Card key={post.id} className="mb-3 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex align-items-center mb-2">
              <img
                src={post.photoURL}
                alt=""
                className="rounded-circle me-2"
                style={{ width: "40px" }}
              />
              <h6 className="mb-0">{post.displayName}</h6>
            </div>
            <p>{post.text}</p>
            <div className="d-flex gap-3">
              <Button
                variant={
                  post.likes?.includes(user?.uid)
                    ? "primary"
                    : "outline-primary"
                }
                size="sm"
                onClick={() => handleLike(post.id, post.likes)}
              >
                👍 {post.likes?.length || 0}
              </Button>
              <Button variant="outline-secondary" size="sm">
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
