'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConversations } from '@/hooks/useChat';
import { useAuth } from '@/lib/auth-context';

export default function ChatIndexPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();

  useEffect(() => {
    // Don't redirect if still loading auth or conversations
    if (loading || conversationsLoading) return;

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    // Redirect to first conversation if available
    if (conversations.length > 0) {
      const firstConversation = conversations[0];
      if (firstConversation) {
        router.replace(`/chat/${firstConversation.id}`);
      }
    }
    // If no conversations, stay on this page to show "no conversations" message
  }, [router, loading, conversationsLoading, isLoggedIn, conversations]);

  // Show loading while checking auth and conversations
  if (loading || conversationsLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-600 mb-2">Đang tải...</h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // Show no conversations message if user has no conversations
  if (conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-600 mb-2">Chưa có cuộc trò chuyện</h2>
          <p className="text-gray-500">
            Bạn chưa có cuộc trò chuyện nào. Hãy liên hệ với người bán để bắt đầu trò chuyện.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-600 mb-2">Đang chuyển hướng...</h2>
        <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
}
