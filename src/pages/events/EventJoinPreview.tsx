import InviteActions from "../../components/InviteAction";

const EventJoinPreview = ({ invitation }: { invitation: any }) => {
  // Om det inte finns någon inbjudan alls (t.ex. om man bara hittat länken
  // men inte blivit inbjuden), kan vi visa ett annat meddelande.
  if (!invitation) {
    return (
      <div className="text-center py-5 px-3">
        <div className="mb-3" style={{ fontSize: "2rem" }}>
          🔒
        </div>
        <h4 className="fw-bold">Privat event</h4>
        <p className="text-muted">
          Detta flöde är endast till för inbjudna gäster.
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3">
      {/* Ikonen/Cirkeln */}
      <div
        className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-4"
        style={{ width: "80px", height: "80px" }}
      >
        <span style={{ fontSize: "2rem" }}>💬</span>
      </div>

      <h4 className="fw-bold mb-2">Häng med i snacket!</h4>
      <p className="text-muted mb-4" style={{ maxWidth: "300px" }}>
        Flödet och chatten är endast tillgänglig för de som tackat ja till
        eventet.
      </p>

      {/* Action-sektionen med knapparna */}
      <div className="w-100 mb-4" style={{ maxWidth: "320px" }}>
        <InviteActions invitation={invitation} size="lg" />
      </div>

      {/* Info-boxen */}
      <div className="p-3 border rounded-4 bg-light w-100 mb-3">
        <p className="small text-secondary mb-0">
          När du tackar ja får du tillgång till meddelanden, deltagarlistan och
          kan skriva egna inlägg.
        </p>
      </div>

      <small
        className="text-uppercase fw-bold text-primary tracking-widest"
        style={{ fontSize: "0.7rem" }}
      >
        Status: Inväntar svar från dig
      </small>
    </div>
  );
};

export default EventJoinPreview;
