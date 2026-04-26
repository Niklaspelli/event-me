import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button, Spinner } from "react-bootstrap";
import { useAuth } from "../Context/AuthContext";
import SuccessDialog from "./SuccessDialog";

interface Props {
  targetUser: any;
}

const SendFriendRequest = ({ targetUser }: Props) => {
  const { user: currentUser } = useAuth() as any;
  const [status, setStatus] = useState<"none" | "pending" | "friend">("none");
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Skapa en säker variabel för ID:t
  const targetId = targetUser?.id || targetUser?.uid;

  useEffect(() => {
    const checkStatus = async () => {
      // Om vi varken har currentUser eller ett targetId, sluta ladda och gå ur
      if (!currentUser?.uid || !targetId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Kolla vänner (använd targetId här)
        const friendSnap = await getDocs(
          query(
            collection(db, "users", currentUser.uid, "friends"),
            where("__name__", "==", targetId),
          ),
        );

        if (!friendSnap.empty) {
          setStatus("friend");
        } else {
          // 2. Kolla pending
          const requestsRef = collection(db, "friendRequests");
          const q = query(
            requestsRef,
            where("fromId", "==", currentUser.uid),
            where("toId", "==", targetId),
            where("status", "==", "pending"),
          );
          const reqSnap = await getDocs(q);
          if (!reqSnap.empty) setStatus("pending");
          else setStatus("none");
        }
      } catch (err) {
        console.error("Fel vid statuskoll:", err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [currentUser?.uid, targetId]);

  const handleSend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.uid || !targetId) return;

    try {
      const requestId = `${currentUser.uid}_${targetId}`;
      await setDoc(doc(db, "friendRequests", requestId), {
        fromId: currentUser.uid,
        fromName: currentUser.displayName || "Användare",
        fromPhoto: currentUser.photoURL || "",
        toId: targetId,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      setStatus("pending");
      setShowSuccess(true);
    } catch (err) {
      console.error("Kunde inte skicka:", err);
    }
  };

  if (loading) return <Spinner animation="border" size="sm" />;

  // Om de redan är vänner
  if (status === "friend") {
    return (
      <Button
        variant="outline-secondary"
        size="sm"
        disabled
        className="rounded-pill px-3"
      >
        Ni är vänner
      </Button>
    );
  }

  // Om förfrågan redan är skickad (innan vi klickade i denna session)
  if (status === "pending" && !showSuccess) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className="rounded-pill px-3"
      >
        Förfrågan skickad
      </Button>
    );
  }

  return (
    <>
      {/* Om status är pending OCH showSuccess är true, visar vi knappen som "Skickad" men låter SuccessDialog finnas kvar */}
      {status === "pending" ? (
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
          onClick={handleSend}
        >
          Lägg till vän
        </Button>
      )}

      {showSuccess && (
        <SuccessDialog
          show={showSuccess}
          onHide={() => setShowSuccess(false)}
          message={`Vänförfrågan skickad till ${targetUser.displayName}!`}
        />
      )}
    </>
  );
};

export default SendFriendRequest;
