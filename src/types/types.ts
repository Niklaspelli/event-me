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

interface AuthContextType {
  user: FirebaseUser | null;
  logout: () => Promise<void>;
  loading?: boolean;
}

// src/types.ts
export interface EventTypes {
  id?: string;
  title: string;
  description: string;
  location: string;
  city: string;
  datetime: any;
  createdBy: Date;
  creatorName: string;
  createdAt: Date; // Firebase Timestamp
  attendees: string[];
  photoURL: string;
}

export interface ICalendarItem {
  id: string;
  title: string; // Säkerställ att denna är sträng
  description: string;
  location: string;
  start: Date;
  end: Date;
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
