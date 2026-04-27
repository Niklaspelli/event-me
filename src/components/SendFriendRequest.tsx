import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc, // Importera deleteDoc
  writeBatch, // Importera writeBatch för säker borttagning
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
  const [actionLoading, setActionLoading] = useState(false); // Ny state för knapp-laddning

  const targetId = targetUser?.id || targetUser?.uid;

  useEffect(() => {
    const checkStatus = async () => {
      if (!currentUser?.uid || !targetId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const friendSnap = await getDocs(
          query(
            collection(db, "users", currentUser.uid, "friends"),
            where("__name__", "==", targetId),
          ),
        );

        if (!friendSnap.empty) {
          setStatus("friend");
        } else {
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

  // FUNKTION FÖR ATT TA BORT VÄN
  const handleUnfriend = async () => {
    if (!currentUser?.uid || !targetId) return;

    const confirm = window.confirm(
      `Vill du ta bort ${targetUser.displayName} som vän?`,
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const batch = writeBatch(db);

      // Ta bort från min lista
      const myRef = doc(db, "users", currentUser.uid, "friends", targetId);
      batch.delete(myRef);

      // Ta bort från deras lista
      const theirRef = doc(db, "users", targetId, "friends", currentUser.uid);
      batch.delete(theirRef);

      await batch.commit();
      setStatus("none"); // Ändra status så knappen blir "Lägg till vän" igen
    } catch (err) {
      console.error("Kunde inte ta bort vän:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.uid || !targetId) return;

    setActionLoading(true);
    try {
      const requestId = `${currentUser.uid}_${targetId}`;
      await setDoc(doc(db, "friendRequests", requestId), {
        fromId: currentUser.uid,
        fromName: currentUser.displayName || "Användare",
        fromPhoto: currentUser.photoURL || "/default-avatar.png",
        fromEmail: currentUser.email, // Använd vår nya default
        toId: targetId,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      setStatus("pending");
      setShowSuccess(true);
    } catch (err) {
      console.error("Kunde inte skicka:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" size="sm" />;

  // OM DE ÄR VÄNNER - VISA "AVSLUTA VÄNSKAP"
  if (status === "friend") {
    return (
      <Button
        variant="outline-danger"
        size="sm"
        className="rounded-pill px-3 fw-bold"
        onClick={handleUnfriend}
        disabled={actionLoading}
      >
        {actionLoading ? <Spinner size="sm" /> : "Avsluta vänskap"}
      </Button>
    );
  }

  // OM PENDING
  if (status === "pending") {
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

  // STANDARD: LÄGG TILL VÄN
  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="rounded-pill px-3 fw-bold"
        onClick={handleSend}
        disabled={actionLoading}
      >
        {actionLoading ? <Spinner size="sm" /> : "Lägg till vän"}
      </Button>

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
