import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chatApi';
import type { Conversation, MessagesResponse, PaginationParams } from '@/types/chat';
import { useAuth } from '@/lib/auth-context';

// Query Keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

// Hooks for Conversations
export const useConversations = () => {
  const { isLoggedIn } = useAuth();

  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: chatApi.getConversations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isLoggedIn,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.createOrGetConversation,
    onSuccess: (data) => {
      // Update conversations cache
      queryClient.setQueryData(chatKeys.conversations(), (old: Conversation[] | undefined) => {
        if (!old) return [data];
        const exists = old.find((conv) => conv.id === data.id);
        return exists ? old : [data, ...old];
      });
    },
  });
};

// Hooks for Messages
export const useConversationMessages = (
  conversationId: string,
  params?: PaginationParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: [...chatKeys.messages(conversationId), params],
    queryFn: () => chatApi.getConversationMessages(conversationId, params),
    enabled: enabled && !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Infinite query for messages with pagination
export const useInfiniteConversationMessages = (
  conversationId: string,
  limit = 50,
  enabled = true,
) => {
  return useInfiniteQuery({
    queryKey: [...chatKeys.messages(conversationId), 'infinite', limit],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      chatApi.getConversationMessages(conversationId, {
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: MessagesResponse, allPages) => {
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled: enabled && !!conversationId,
    staleTime: 2 * 60 * 1000,
  });
};

// Helper hook to invalidate chat queries
export const useChatQueryInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateConversations: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    invalidateMessages: (conversationId: string) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    },
    invalidateAllChat: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  };
};
