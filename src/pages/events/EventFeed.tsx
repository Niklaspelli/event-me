import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useEventPosts } from "../../hooks/useEventPosts";
import { addPostAndNotify, toggleLike } from "../../services/postService";
import { Card, Button, Form, InputGroup, Modal } from "react-bootstrap";
import Linkify from "linkify-react";

const EventFeed = ({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) => {
  const { user } = useAuth() as any;
  const [newPost, setNewPost] = useState("");
  const [activePostForLikes, setActivePostForLikes] = useState<any>(null);
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
          className="mb-3 shadow-sm text-black border border-secondary border-0 bg-light"
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
            <Linkify options={{ target: "_blank", rel: "noopener noreferrer" }}>
              <p className="my-3">{post.text}</p>
            </Linkify>
            <div className="d-flex gap-3 border-top pt-2 border-secondary">
              <Button
                variant={post.likes?.some((l: any) => l.uid === user?.uid)}
                size="sm"
                className="rounded-pill"
                onClick={() =>
                  toggleLike(eventId, post.id, user, post.likes || [])
                }
              >
                👍 {post.likes?.length || 0}
              </Button>

              <div className="d-flex align-items-center">
                <div className="avatar-group d-flex me-2">
                  {post.likes?.slice(0, 3).map((like: any, index: number) => (
                    <img
                      key={like.uid}
                      src={like.photoURL || "/default-avatar.png"}
                      className="rounded-circle border border-white"
                      style={{
                        width: "24px",
                        height: "24px",
                        marginLeft: index === 0 ? "0" : "-8px",
                      }}
                      alt={like.displayName}
                    />
                  ))}
                </div>
                <small
                  onClick={() => setActivePostForLikes(post)} // Sätter DETTA inlägg som aktivt
                  style={{ cursor: "pointer" }}
                  className="text-muted text-decoration-underline"
                >
                  {post.likes?.length || 0}{" "}
                  {post.likes?.length === 1 ? "person" : "personer"} har gillat
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* MODALEN FLYTTAD HIT - UTANFÖR LOOPEN */}
      <Modal
        show={!!activePostForLikes}
        onHide={() => setActivePostForLikes(null)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1.1rem" }}>
            Gillas av ({activePostForLikes?.likes?.length || 0})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ maxHeight: "400px", overflowY: "auto", padding: "1rem" }}
        >
          <div className="d-flex flex-column gap-3">
            {activePostForLikes?.likes &&
            activePostForLikes.likes.length > 0 ? (
              activePostForLikes.likes.map((like: any) => (
                <div key={like.uid} className="d-flex align-items-center gap-3">
                  <img
                    src={like.photoURL || "/default-avatar.png"}
                    alt={like.displayName}
                    className="rounded-circle"
                    style={{
                      width: "36px",
                      height: "36px",
                      objectFit: "cover",
                    }}
                  />
                  <span className="fw-medium text-dark">
                    {like.displayName || "Okänd användare"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">
                Inga gilla-markeringar än.
              </p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventFeed;
