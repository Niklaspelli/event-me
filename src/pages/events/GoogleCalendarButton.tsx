interface CalendarProps {
  event: {
    title: string;
    datetime: string;
    description?: string;
    location?: string;
  };
}

const GoogleCalendarButton = ({ event }: CalendarProps) => {
  const getGoogleCalendarLink = () => {
    const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
    const start = new Date(event.datetime);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatTime = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const params = new URLSearchParams({
      text: event.title,
      dates: `${formatTime(start)}/${formatTime(end)}`,
      details: event.description || "",
      location: event.location || "",
    });
    return `${baseUrl}&${params.toString()}`;
  };

  return (
    <button
      className="btn btn-outline-success btn-sm rounded-pill mt-2 fw-bold"
      onClick={() => window.open(getGoogleCalendarLink(), "_blank")}
    >
      + Lägg till i Google Kalender
    </button>
  );
};

export default GoogleCalendarButton;
