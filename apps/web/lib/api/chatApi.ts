import { api } from '@/lib/axios';
import {
  Conversation,
  CreateConversationDto,
  MessagesResponse,
  PaginationParams,
} from '@/types/chat';

// API Base URL
const CHAT_API_URL = '/conversations';

// Chat API Functions
export const chatApi = {
  // Get all conversations for current user
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get(CHAT_API_URL);
    return response.data.data;
  },

  // Create or get existing conversation
  createOrGetConversation: async (dto: CreateConversationDto): Promise<Conversation> => {
    const response = await api.post(CHAT_API_URL, dto);
    return response.data.data;
  },

  // Get messages for a conversation
  getConversationMessages: async (
    conversationId: string,
    params?: PaginationParams,
  ): Promise<MessagesResponse> => {
    const response = await api.get(`${CHAT_API_URL}/${conversationId}/messages`, {
      params,
    });
    return {
      messages: response.data.data,
      total: response.data.meta?.total ?? response.data.data?.length ?? 0,
    };
  },
};
