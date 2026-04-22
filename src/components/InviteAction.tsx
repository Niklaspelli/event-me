import { Button, Stack } from "react-bootstrap";
import {
  acceptEventInvite,
  declineEventInvite,
} from "../services/inviteService";
import { useAuth } from "../Context/AuthContext";

interface InviteActionsProps {
  invitation: any;
  onSuccess?: () => void; // Valfritt: t.ex. stänga en modal eller dropdown
  size?: "sm" | "lg";
}

const InviteActions = ({ invitation, onSuccess, size }: InviteActionsProps) => {
  const { user } = useAuth();

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Hindra att man navigerar om knappen ligger i en länk
    try {
      await acceptEventInvite(user, invitation);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Acceptera misslyckades:", error);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await declineEventInvite(invitation.id);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Neka misslyckades:", error);
    }
  };

  return (
    <Stack direction="horizontal" gap={2} className="w-100">
      <Button
        variant="success"
        size={size || "sm"}
        className="w-100 rounded-pill fw-bold"
        onClick={handleAccept}
      >
        Kommer
      </Button>
      <Button
        variant="outline-danger"
        size={size || "sm"}
        className="w-100 rounded-pill"
        onClick={handleDecline}
      >
        Kan inte
      </Button>
    </Stack>
  );
};

export default InviteActions;
