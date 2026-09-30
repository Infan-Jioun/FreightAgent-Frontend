/**
 * RAG Domain Types & Data Contracts
 * Defines compile-time type safety for FreightAgent's Retrieval-Augmented Generation AI module.
 */

export type RagContextType =
  | "TRACKING"
  | "LOCATION"
  | "CORRIDOR"
  | "PRICING"
  | "AGENT"
  | "KNOWLEDGE_BASE";

export interface IRagContextSource {
  type: RagContextType;
  title: string;
  detail?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface IRagQueryPayload {
  message: string;
  sessionId?: string;
  model?: string;
}

export interface IRagQueryResponseData {
  answer: string;
  sessionId: string;
  contextSources: IRagContextSource[];
  isCached: boolean;
  modelUsed: string;
}

export interface IRagChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  sources?: IRagContextSource[];
  isCached?: boolean;
  modelUsed?: string;
}

export interface IPublicDirectoryPort {
  code: string;
  name: string;
  country: string;
  type?: string;
}

export interface IPublicDirectoryCorridor {
  origin: string;
  destination: string;
  transitTimeDays?: number;
  mode?: string;
}

export interface IRagPublicDirectoryData {
  ports: IPublicDirectoryPort[];
  corridors: IPublicDirectoryCorridor[];
  supportedRegions: string[];
}

export interface IApiResponse<T> {
  statusCode?: number;
  httpStatusCode?: number;
  success: boolean;
  message: string;
  data: T;
}
