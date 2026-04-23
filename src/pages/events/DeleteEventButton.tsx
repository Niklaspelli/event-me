import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { deleteEventService } from "../../services/deleteEventService";
import ConfirmDialog from "../../components/ConfirmDialog";

interface Props {
  eventId: string;
  creatorId: string;
}

const DeleteEventButton = ({ eventId, creatorId }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { user } = useAuth() as any;
  const navigate = useNavigate();

  // Visa bara knappen om den inloggade användaren är skaparen
  if (user?.uid !== creatorId) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEventService(eventId);
      // Vi behöver inte stänga modalen manuellt om vi navigerar bort direkt
      navigate("/dashboard");
    } catch (error) {
      console.error("Radering misslyckades:", error);
      alert("Kunde inte radera eventet. Försök igen.");
      setIsDeleting(false); // Låt användaren försöka igen om det sket sig
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDeleteModal(true)} // Öppna modalen istället för fönstret
        disabled={isDeleting}
        className="delete-btn"
        style={{
          backgroundColor: isDeleting ? "#ccc" : "#ff4d4d",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: isDeleting ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {isDeleting ? "Raderar..." : "Radera häng"}
      </button>

      <ConfirmDialog
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete} // Anropa din städ-funktion här
        isLoading={isDeleting}
        title="Radera häng"
        message="Är du helt säker? Detta kommer att radera eventet och alla inbjudningar permanent."
      />
    </>
  );
};

export default DeleteEventButton;
