// src/types.ts

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  lastLogin: Date;
  bio?: string; // Valfritt fält
}

export interface EventItem {
  id?: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  createdBy: string; // Användarens UID
  type: "spontaneous" | "planned";
  attendees: string[]; // Lista på UID:n
}
