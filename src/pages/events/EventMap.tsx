interface EventMapProps {
  location?: string;
}

const EventMap = ({ location }: EventMapProps) => {
  if (!location) return null;

  const encodedLocation = encodeURIComponent(location);
  const mapUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mt-3">
      <h5 className="fw-bold">Plats</h5>
      <p className="text-secondary mb-2">📍 {location}</p>
      <div
        className="rounded-3 overflow-hidden border shadow-sm"
        style={{ height: "200px" }}
      >
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          title="Event Location"
          src={mapUrl}
        ></iframe>
      </div>
    </div>
  );
};

export default EventMap;
