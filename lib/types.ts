export type UserRole = "admin" | "staff";

export interface WeddingHall {
  id: string;
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  availability: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  timeRange: string;
  status: "available" | "booked";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: Date;
  channel: "general" | "duyurular";
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  hallId: string;
  hallName: string;
  date: string;
  timeSlot: string;
  status: "pending" | "approved" | "rejected";
  message: string;
  responses: RequestResponse[];
  createdAt: Date;
}

export interface RequestResponse {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: Date;
}

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
