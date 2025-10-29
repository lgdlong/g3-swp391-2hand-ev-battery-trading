'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first chat by default
    router.replace('/chat/chat1');
  }, [router]);

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-600 mb-2">Đang chuyển hướng...</h2>
        <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
}
