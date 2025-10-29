'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';

// Mock data
const mockChats = [
  {
    id: 'chat1',
    sellerName: 'Ms Phương Thảo Vinfast',
    sellerAvatar:
      'https://lh3.googleusercontent.com/a/ACg8ocIRVcncypNY0pxX-3uuJ3ml3ru50UN1T87ISG3ds6X6bZ3dRdsg9A=s96-c',
    lastMessage: 'Dạ xe này bên em còn ạ...',
    lastMessageTime: '5 phút trước',
    product: {
      image:
        'https://lh3.googleusercontent.com/a/ACg8ocIRVcncypNY0pxX-3uuJ3ml3ru50UN1T87ISG3ds6X6bZ3dRdsg9A=s96-c',
      title: 'VF5 TRẢ TRƯỚC 0 ĐỒNG, VINCLUB 10TR, GIẢM GIÁ XE4%',
      price: '495.000.000 đ',
    },
    messages: [
      { id: 'm1', sender: 'user', text: 'Xe này còn không ạ?' },
      {
        id: 'm2',
        sender: 'seller',
        text: 'Dạ xe này bên em còn ạ. Anh chị có muốn xem thêm thông tin chi tiết không?',
      },
      { id: 'm3', sender: 'user', text: 'Vâng, em muốn biết thêm về tình trạng pin ạ' },
      {
        id: 'm4',
        sender: 'seller',
        text: 'Pin xe còn rất tốt, dung lượng còn 85%. Em có thể gửi anh chị báo cáo chi tiết về pin được ạ',
      },
    ],
  },
  {
    id: 'chat2',
    sellerName: 'Anh Minh Toyota',
    sellerAvatar: 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=User2',
    lastMessage: 'Xe Camry này tình trạng rất tốt...',
    lastMessageTime: '1 giờ trước',
    product: {
      image: 'https://placehold.co/600x400/EFEFEF/AAAAAA?text=Camry',
      title: 'Toyota Camry 2022 - Pin lai tốt',
      price: '850.000.000 đ',
    },
    messages: [
      { id: 'm5', sender: 'user', text: 'Xe Camry này tình trạng như thế nào ạ?' },
      {
        id: 'm6',
        sender: 'seller',
        text: 'Xe Camry này tình trạng rất tốt, đi được 2 năm, pin lai vẫn hoạt động bình thường',
      },
    ],
  },
  {
    id: 'chat3',
    sellerName: 'Chị Lan BMW',
    sellerAvatar: 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=User3',
    lastMessage: 'BMW i3 này đã qua sử dụng nhưng...',
    lastMessageTime: '3 giờ trước',
    product: {
      image: 'https://placehold.co/600x400/EFEFEF/AAAAAA?text=BMWi3',
      title: 'BMW i3 2021 - Xe điện cao cấp',
      price: '1.200.000.000 đ',
    },
    messages: [
      { id: 'm7', sender: 'user', text: 'BMW i3 này còn bảo hành không ạ?' },
      {
        id: 'm8',
        sender: 'seller',
        text: 'BMW i3 này đã qua sử dụng nhưng vẫn còn bảo hành pin từ hãng đến 2025 ạ',
      },
    ],
  },
];

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || 'chat1');
  const [chats, setChats] = useState(mockChats);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleSendMessage = (message: string) => {
    if (!activeChatId) return;

    const newMessage = {
      id: `m${Date.now()}`,
      sender: 'user',
      text: message,
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: message,
              lastMessageTime: 'Vừa xong',
            }
          : chat,
      ),
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      <Sidebar chats={chats} activeChatId={activeChatId} onChatSelect={handleChatSelect} />
      <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} />
    </div>
  );
}
