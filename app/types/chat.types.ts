/**
 * Realtime Shipment Chat Domain Types & Data Contracts
 * Defines compile-time type safety for carrier-customer-admin dispatch communication.
 */

export type MessageType = "TEXT" | "FILE";

export interface IChatParticipant {
  id: string;
  name: string;
  role: string;
  image: string | null;
  avatar?: string | null;
  email?: string;
  phone?: string | null;
}

export type IChatUser = IChatParticipant;

export interface IConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId?: string | null; // For Optimistic UI matching
  type: MessageType;               // 'TEXT' | 'FILE'
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  isRead: boolean;
  isEdited: boolean;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender: IChatParticipant;
  // UI-only helper status:
  status?: "sending" | "sent" | "failed";
}

export type IChatMessage = IConversationMessage;
export type IMessage = IConversationMessage;

export interface IConversationShipment {
  id: string;
  trackingId: string;
  origin?: string;
  destination?: string;
  status: string;
  cargoType?: string;
}

export interface IConversation {
  id: string;
  shipmentId: string | null;
  customerId: string;
  agentId: string;
  lastMessage: string | null;
  lastMessageId?: string | null;
  lastMessageAt: string;
  customerUnread: number;
  agentUnread: number;
  unreadCount?: number;
  customer: IChatParticipant;
  agent: IChatParticipant;
  shipment?: {
    id: string;
    trackingId: string;
    origin: string;
    destination: string;
    status: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  messages?: IConversationMessage[];
}

export interface ICreateConversationPayload {
  shipmentId: string;
}

export interface ISendMessagePayload {
  conversationId: string;
  content: string;
  clientMessageId?: string;
  type?: MessageType;
}

export interface ISendMessageHttpPayload {
  content: string;
  clientMessageId?: string;
  type?: MessageType;
}

export interface IEditMessagePayload {
  conversationId: string;
  messageId: string;
  content: string;
}

export interface IEditMessageHttpPayload {
  content: string;
}

export interface IJoinConversationPayload {
  conversationId: string;
}

export interface IMarkReadPayload {
  conversationId: string;
}

export interface IUserTypingSocketPayload {
  userId: string;
  conversationId: string;
}

export interface IMessagesReadSocketPayload {
  conversationId: string;
  readBy: string;
  readAt: string;
}

export interface IChatErrorSocketPayload {
  statusCode?: number;
  message: string;
  clientMessageId?: string | null;
}

export interface ISessionExpiredSocketPayload {
  message?: string;
}

export interface IConversationClosedSocketPayload {
  conversationId: string;
  shipmentId?: string;
  message?: string;
}

export interface IGetMessagesParams {
  limit?: number;
  cursor?: string;
  after?: string;
}

export interface IGetMessagesResponse {
  messages: IConversationMessage[];
  nextCursor?: string | null;
  resetRequired?: boolean;
}

