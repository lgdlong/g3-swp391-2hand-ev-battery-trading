import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat - Tin nhắn',
  description: 'Nhắn tin với người bán về sản phẩm xe điện',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
