/** Backend-aligned: Editor = admin, Viewer = staff */
export type UserRole = "Editor" | "Viewer";

export interface WeddingHall {
  id: string;
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  /** Mock only (Dashboard CalendarView). API halls use separate Schedule[] */
  availability?: Array<{ id: string; timeRange: string; status: "available" | "booked" }>;
}

/**
 * Backend Schedule DTO. Use date, startTime, endTime (no timeRange).
 * status: Available | Reserved.
 */
export interface Schedule {
  id: string;
  weddingHallId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Reserved";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

/** Mesajlar page – mock only; no Messages API */
export interface Message {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: Date;
  channel: "general" | "duyurular";
}

/**
 * Backend Request DTO. status: Pending | Answered only (no approved/rejected).
 * hallName joined client-side for display.
 */
export interface Request {
  id: string;
  weddingHallId: string;
  createdByUserId: string;
  message: string;
  status: "Pending" | "Answered";
  createdAt: string;
  hallName: string;
}

/** Mesajlar – mock only; no API */
export interface RequestResponse {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: Date;
}

/** Takvim: Schedules displayed as calendar slots. No Events API. */
export type EventType = "nikah" | "nisan" | "konser" | "toplanti" | "ozel";

export interface Event {
  id: string;
  title: string;
  type: EventType;
  hallId: string;
  hallName: string;
  date: string;
  timeSlot: string;
  description?: string;
  guestCount?: number;
  contactName?: string;
  contactPhone?: string;
  createdBy: string;
  createdAt: Date;
}
