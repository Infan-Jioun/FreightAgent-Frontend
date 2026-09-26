/**
 * Realtime Shipment Chat Domain Types & Data Contracts
 * Defines compile-time type safety for carrier-customer-admin dispatch communication.
 */

export interface IChatUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "ADMIN" | "AGENT" | "CUSTOMER" | string;
  avatar?: string | null;
}

export interface IChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  sender?: IChatUser;
}

export interface IConversationShipment {
  id: string;
  trackingId: string;
  origin?: string;
  destination?: string;
  status?: string;
  cargoType?: string;
}

export interface IConversation {
  id: string;
  shipmentId: string;
  customerId: string;
  agentId?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  shipment?: IConversationShipment;
  customer?: IChatUser;
  agent?: IChatUser | null;
  messages?: IChatMessage[];
}

export interface ICreateConversationPayload {
  shipmentId: string;
}

export interface ISendMessagePayload {
  conversationId: string;
  content: string;
}

export interface ISendMessageHttpPayload {
  content: string;
}

export interface IJoinConversationPayload {
  conversationId: string;
}

export interface IUserTypingSocketPayload {
  userId: string;
  conversationId: string;
}

export interface IChatErrorSocketPayload {
  statusCode: number;
  message: string;
}
