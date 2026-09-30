/**
 * Realtime Shipment Chat Service
 * Production API communication layer for consignment conversations and message history.
 */

import api from "../lib/api";
import { API } from "../constants/api";
import {
  IConversation,
  IConversationMessage,
  IChatMessage,
  ICreateConversationPayload,
  ISendMessageHttpPayload,
  IGetMessagesParams,
  IGetMessagesResponse,
} from "../types/chat.types";
import { AppError } from "../errorHelper/appError";
import { IApiResponse } from "../types/rag.types";

export * from "../types/chat.types";

export const chatService = {
  /**
   * Open or retrieve active conversation session for a shipment
   */
  getOrCreateConversation: async (shipmentId: string): Promise<IConversation> => {
    try {
      const payload: ICreateConversationPayload = { shipmentId };
      const res = await api.post<IApiResponse<IConversation>>(
        API.CHAT.CONVERSATION,
        payload
      );
      return res.data.data;
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Retrieve all conversations for the authenticated user (Customer, Agent, Admin)
   */
  getUserConversations: async (): Promise<IConversation[]> => {
    try {
      const res = await api.get<IApiResponse<IConversation[]>>(
        API.CHAT.CONVERSATIONS
      );
      return res.data?.data || [];
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Retrieve message history for a conversation with cursor pagination & catch-up support
   * Supports:
   * - limit: number of messages (default 30)
   * - cursor: oldestMessageId to paginate upwards
   * - after: latestMessageId for reconnection catch-up
   */
  getConversationMessages: async (
    conversationId: string,
    params?: IGetMessagesParams
  ): Promise<IGetMessagesResponse> => {
    if (!conversationId) {
      return { messages: [] };
    }
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.set("limit", String(params.limit));
      if (params?.cursor) queryParams.set("cursor", params.cursor);
      if (params?.after) queryParams.set("after", params.after);

      const queryString = queryParams.toString();
      const url = `${API.CHAT.MESSAGES(conversationId)}${queryString ? `?${queryString}` : ""}`;

      const res = await api.get<any>(url);
      const rawBody = res.data;
      const rawData = rawBody?.data !== undefined ? rawBody.data : rawBody;

      let messagesArray: IConversationMessage[] = [];
      let nextCursor: string | null = null;
      let resetRequired = false;

      if (Array.isArray(rawData)) {
        messagesArray = rawData;
        nextCursor = rawData.length > 0 ? rawData[0].id : null;
      } else if (rawData && typeof rawData === "object") {
        if (Array.isArray(rawData.messages)) {
          messagesArray = rawData.messages;
        } else if (Array.isArray(rawData.data)) {
          messagesArray = rawData.data;
        } else if (Array.isArray(rawData.result)) {
          messagesArray = rawData.result;
        }
        nextCursor = rawData.nextCursor ?? (messagesArray.length > 0 ? messagesArray[0].id : null);
        resetRequired = Boolean(rawData.resetRequired);
      }

      return {
        messages: Array.isArray(messagesArray) ? messagesArray : [],
        nextCursor,
        resetRequired,
      };
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Mark all counterparty messages in conversation as read via REST fallback
   */
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    if (!conversationId) return;
    try {
      await api.patch(API.CHAT.READ(conversationId));
    } catch (err: unknown) {
      // Non-blocking error handling
      console.warn("REST mark read fallback failed:", err);
    }
  },

  /**
   * Send message via REST HTTP fallback if WebSocket connection is unavailable
   */
  sendMessageHttp: async (
    conversationId: string,
    content: string,
    clientMessageId?: string
  ): Promise<IConversationMessage> => {
    try {
      const payload: ISendMessageHttpPayload = {
        content,
        clientMessageId,
        type: "TEXT",
      };
      const res = await api.post<IApiResponse<IConversationMessage>>(
        API.CHAT.MESSAGES(conversationId),
        payload
      );
      return res.data.data;
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Edit previously sent message via REST fallback
   */
  editMessage: async (
    conversationId: string,
    messageId: string,
    content: string
  ): Promise<IConversationMessage> => {
    try {
      const res = await api.patch<IApiResponse<IConversationMessage>>(
        API.CHAT.MESSAGE(conversationId, messageId),
        { content }
      );
      return res.data.data;
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Upload file attachment (max 10MB) to conversation via multipart/form-data
   */
  uploadAttachment: async (
    conversationId: string,
    file: File
  ): Promise<IConversationMessage> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<IApiResponse<IConversationMessage>>(
        API.CHAT.UPLOAD(conversationId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.data;
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },
};

export default chatService;

