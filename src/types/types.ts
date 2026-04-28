// src/types.ts

export interface UserTypes {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
  bio?: string; // Valfritt fält
}

/* export interface EventType {
  id?: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  createdBy: string; // Användarens UID
  type: "spontaneous" | "planned";
  attendees: string[]; // Lista på UID:n
} */

// src/types.ts
export interface EventTypes {
  id?: string;
  title: string;
  description: string;
  location: string;
  city: string;
  datetime: any;
  createdBy: string;
  creatorName: string;
  createdAt: any; // Firebase Timestamp
  attendees: string[];
  photoURL: string;
}

export interface CalendarTypes {
  event: {
    title: string;
    datetime: string;
    description?: string;
    location?: string;
  };
}

export interface InviteModalTypes {
  show: boolean;
  onHide: () => void;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  createdBy: string; // Viktigt: skickas från föräldern
  location: string;
  email: string;
}
