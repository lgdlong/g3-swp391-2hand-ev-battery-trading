import { AccountRole, AccountStatus, PostStatus, PostType } from './enums';

export interface Account {
  id: number;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: AccountStatus;
  role: AccountRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostImage {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format?: string | null;
  position: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  postType: PostType;
  title: string;
  description: string;
  wardCode: string;
  provinceNameCached: string | null;
  districtNameCached: string | null;
  wardNameCached: string | null;
  addressTextCached: string | null;
  priceVnd: string;
  isNegotiable: boolean;
  status: PostStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  seller: Account;
  images?: PostImage[];
  createdAt: Date;
  updatedAt: Date;
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
