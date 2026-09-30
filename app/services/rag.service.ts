/**
 * RAG Service
 * Production API communication layer for FreightAgent's AI Assistant & Knowledge Base.
 */

import api from "../lib/api";
import { API } from "../constants/api";
import {
  IApiResponse,
  IRagChatMessage,
  IRagPublicDirectoryData,
  IRagQueryPayload,
  IRagQueryResponseData,
} from "../types/rag.types";
import { AppError } from "../errorHelper/appError";

export * from "../types/rag.types";

export const ragService = {
  /**
   * Submit an inquiry to FreightAgent RAG Assistant
   * Rate limited: 20 requests per 5 minutes on backend
   */
  askQuestion: async (payload: IRagQueryPayload): Promise<IRagQueryResponseData> => {
    try {
      const res = await api.post<IApiResponse<IRagQueryResponseData>>(
        API.RAG.CHAT,
        payload,
        { skipAuthRedirect: true }
      );
      return res.data.data;
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Retrieve active session history from Redis conversation memory
   */
  getSessionHistory: async (sessionId: string): Promise<IRagChatMessage[]> => {
    if (!sessionId) return [];
    try {
      const res = await api.get<IApiResponse<IRagChatMessage[]>>(
        API.RAG.SESSION(sessionId),
        { skipAuthRedirect: true }
      );
      return res.data?.data || [];
    } catch {
      // Graceful fallback for cold or expired sessions
      return [];
    }
  },

  /**
   * Delete conversation memory for a session from Redis
   */
  clearSession: async (sessionId: string): Promise<void> => {
    if (!sessionId) return;
    try {
      await api.delete<IApiResponse<null>>(API.RAG.SESSION(sessionId), {
        skipAuthRedirect: true,
      });
    } catch (err: unknown) {
      throw AppError.fromAxios(err);
    }
  },

  /**
   * Retrieve public directory for ports, corridors, and supported regions
   */
  getPublicDirectory: async (): Promise<IRagPublicDirectoryData | null> => {
    try {
      const res = await api.get<IApiResponse<IRagPublicDirectoryData>>(
        API.RAG.PUBLIC_DIRECTORY,
        { skipAuthRedirect: true }
      );
      return res.data?.data || null;
    } catch {
      return null;
    }
  },
};

export default ragService;
