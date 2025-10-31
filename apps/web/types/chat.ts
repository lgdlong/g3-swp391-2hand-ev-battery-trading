export interface Account {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface Post {
  id: string;
  title: string;
  price: number;
  images?: string[];
}

export interface Message {
  id: string;
  content: string;
  senderId: number;
  conversationId: string;
  createdAt: Date;
  sender: Account;
}

export interface Conversation {
  id: string;
  postId: string;
  buyerId: number;
  sellerId: number;
  createdAt: Date;
  updatedAt: Date;
  post: Post;
  buyer: Account;
  seller: Account;
  lastMessage?: Message;
  messages?: Message[];
}

export interface CreateConversationDto {
  postId: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
