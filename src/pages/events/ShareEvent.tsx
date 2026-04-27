import { Button } from "react-bootstrap";
import { FiShare2 } from "react-icons/fi"; // Viktigt: använd måsvingar för Bootstrap-komponenter

// Definiera vad komponenten förväntar sig för data (Props)
interface ShareEventProps {
  eventTitle: string;
  eventId: string | number; // ID kan vara både sträng eller siffra
}

function ShareEvent({ eventTitle, eventId }: ShareEventProps) {
  const handleShare = async () => {
    const baseDomain = window.location.origin;
    const shareData = {
      title: `Inbjudan till: ${eventTitle}! 🎉`,
      text: `Du är bjuden på ${eventTitle}! Kolla in detaljerna här:`,
      url: `${baseDomain}/events/event-details/${eventId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log("Delning lyckades!");
      } else {
        // Fallback: Kopiera till urklipp istället för bara en alert
        await navigator.clipboard.writeText(shareData.url);
        alert("Länken är kopierad till urklipp! Dela den i valfri chatt.");
      }
    } catch (err) {
      // Logga inte error om användaren bara ångrade sig (stängde menyn)
      if ((err as Error).name !== "AbortError") {
        console.error("Delningsfel:", err);
      }
    }
  };

  return (
    <Button
      variant="dark"
      className="d-flex align-items-center gap-3 rounded-pill px-3 m-2"
      onClick={handleShare}
    >
      <FiShare2 size={18} />
      Dela
    </Button>
  );
}

export default ShareEvent;
