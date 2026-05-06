import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useEventPosts } from "../../hooks/useEventPosts";
import { addPostAndNotify, toggleLike } from "../../services/postService";
import { Card, Button, Form, InputGroup } from "react-bootstrap";

const EventFeed = ({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) => {
  const { user } = useAuth() as any;
  const [newPost, setNewPost] = useState("");
  const posts = useEventPosts(eventId); // Använder vår nya hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;

    try {
      await addPostAndNotify(eventId, eventTitle, newPost, user);
      setNewPost("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <h5 className="fw-bold mb-4">Händelsevägg</h5>

      {/* Post-formulär */}
      <Card className="mb-4 shadow-sm border-secondary">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Skriv något..."
              />
              <Button variant="dark" type="submit">
                Posta
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Inläggslista */}
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
                onClick={() =>
                  toggleLike(eventId, post.id, user.uid, post.likes || [])
                }
              >
                👍 {post.likes?.length || 0}
              </Button>
              {/*  <Button variant="outline-dark" size="sm" className="rounded-pill">
                💬 Svara
              </Button> */}
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default EventFeed;
