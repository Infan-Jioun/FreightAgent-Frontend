/**
 * Realtime Shipment Chat Service
 * Production API communication layer for consignment conversations and message history.
 */

import api from "../lib/api";
import { API } from "../constants/api";
import {
  IConversation,
  IChatMessage,
  ICreateConversationPayload,
  ISendMessageHttpPayload,
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
   * Retrieve previous message history for a conversation
   * Automatically marks unread counterparty messages as read on the backend
   */
  getConversationMessages: async (conversationId: string): Promise<IChatMessage[]> => {
    if (!conversationId) return [];
    try {
      const res = await api.get<IApiResponse<IChatMessage[]>>(
        API.CHAT.MESSAGES(conversationId)
      );
      return res.data?.data || [];
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Send message via REST HTTP fallback if WebSocket connection is unavailable
   */
  sendMessageHttp: async (
    conversationId: string,
    content: string
  ): Promise<IChatMessage> => {
    try {
      const payload: ISendMessageHttpPayload = { content };
      const res = await api.post<IApiResponse<IChatMessage>>(
        API.CHAT.MESSAGES(conversationId),
        payload
      );
      return res.data.data;
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },
};

export default chatService;
