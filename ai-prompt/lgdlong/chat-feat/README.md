# Chat Module Documentation

## Tổng quan

Module Chat cung cấp tính năng nhắn tin thời gian thực giữa người mua (Buyer) và người bán (Seller) về một tin đăng (Post) cụ thể.

## Cấu trúc Module

```
src/modules/chat/
├── entities/
│   ├── conversation.entity.ts    # Entity cuộc trò chuyện
│   └── message.entity.ts         # Entity tin nhắn
├── dto/
│   ├── create-conversation.dto.ts
│   └── send-message.dto.ts
├── chat.controller.ts            # RESTful API endpoints
├── chat.service.ts               # Business logic
├── chat.gateway.ts               # WebSocket gateway
├── chat.module.ts                # Module definition
└── README.md                     # This file
```

## Mô hình Dữ liệu

### Conversation
- `id`: Primary key
- `postId`: Foreign key đến Post
- `buyerId`: Foreign key đến Account (người mua)
- `sellerId`: Foreign key đến Account (người bán)
- **Constraint**: UNIQUE(postId, buyerId) - đảm bảo mỗi buyer chỉ có 1 conversation cho 1 post

### Message
- `id`: Primary key
- `content`: Nội dung tin nhắn
- `senderId`: Foreign key đến Account (người gửi)
- `conversationId`: Foreign key đến Conversation
- `createdAt`: Thời gian tạo

## API Endpoints

### 1. POST /conversations
**Mô tả**: Tạo hoặc lấy cuộc trò chuyện hiện có

**Request Body**:
```json
{
  "postId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "postId": "123",
    "buyerId": 456,
    "sellerId": 789,
    "post": { "id": "123", "title": "Battery for sale" },
    "buyer": { "id": 456, "fullName": "John Doe" },
    "seller": { "id": 789, "fullName": "Jane Smith" }
  },
  "message": "Conversation ready"
}
```

### 2. GET /conversations
**Mô tả**: Lấy tất cả cuộc trò chuyện của user hiện tại

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "post": { "title": "Battery for sale" },
      "buyer": { "fullName": "John Doe" },
      "seller": { "fullName": "Jane Smith" },
      "messages": [
        {
          "content": "Last message content",
          "createdAt": "2023-10-27T10:00:00Z",
          "sender": { "fullName": "John Doe" }
        }
      ]
    }
  ],
  "message": "Conversations retrieved successfully"
}
```

### 3. GET /conversations/:id/messages
**Mô tả**: Lấy tin nhắn của một cuộc trò chuyện (có phân trang)

**Query Parameters**:
- `page`: Số trang (default: 1)
- `limit`: Số tin nhắn mỗi trang (default: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "content": "Hello, is this battery still available?",
      "senderId": 456,
      "conversationId": "1",
      "createdAt": "2023-10-27T10:00:00Z",
      "sender": { "id": 456, "fullName": "John Doe" }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  },
  "message": "Messages retrieved successfully"
}
```

## WebSocket Events

### Kết nối
**Namespace**: `/chat`

**Authentication**: Gửi JWT token qua `handshake.auth.token`

```javascript
const socket = io('/chat', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

### Events

#### 1. sendMessage (Client → Server)
**Mô tả**: Gửi tin nhắn mới

**Payload**:
```json
{
  "conversationId": "string",
  "content": "string"
}
```

#### 2. newMessage (Server → Client)
**Mô tả**: Nhận tin nhắn mới

**Payload**:
```json
{
  "id": "string",
  "content": "string",
  "senderId": number,
  "conversationId": "string",
  "createdAt": "string",
  "sender": {
    "id": number,
    "fullName": "string"
  }
}
```

#### 3. joinConversation (Client → Server)
**Mô tả**: Tham gia room của một cuộc trò chuyện

**Payload**:
```json
{
  "conversationId": "string"
}
```

#### 4. leaveConversation (Client → Server)
**Mô tả**: Rời khỏi room của một cuộc trò chuyện

**Payload**:
```json
{
  "conversationId": "string"
}
```

#### 5. error (Server → Client)
**Mô tả**: Thông báo lỗi

**Payload**:
```json
{
  "message": "string",
  "errors": ["string"] // Optional validation errors
}
```

## Frontend Integration Example

### React/Next.js Example

```typescript
import { io, Socket } from 'socket.io-client';

class ChatService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('/chat', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat');
    });

    this.socket.on('newMessage', (message) => {
      console.log('New message:', message);
      // Update UI with new message
    });

    this.socket.on('error', (error) => {
      console.error('Chat error:', error);
    });
  }

  sendMessage(conversationId: string, content: string) {
    this.socket?.emit('sendMessage', {
      conversationId,
      content
    });
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('joinConversation', {
      conversationId
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
```

## Database Migration

Để tạo bảng trong database, chạy lệnh migration:

```sql
-- Conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, buyer_id)
);

-- Messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_post_id ON conversations(post_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## Security

1. **Authentication**: Tất cả endpoints và WebSocket connections đều yêu cầu JWT token hợp lệ
2. **Authorization**: Users chỉ có thể:
   - Tạo conversation cho posts của người khác (không thể chat với chính mình)
   - Xem conversations mà họ tham gia (buyer hoặc seller)
   - Gửi/nhận messages trong conversations của họ
3. **Validation**: Tất cả input đều được validate bằng class-validator

## Testing

### Unit Tests
```bash
npm run test -- chat
```

### Integration Tests
```bash
npm run test:e2e -- chat
```

## Performance Considerations

1. **Database Indexes**: Đã tạo indexes cho các truy vấn phổ biến
2. **Pagination**: Messages được phân trang để tránh load quá nhiều dữ liệu
3. **WebSocket Rooms**: Sử dụng rooms để chỉ broadcast tin nhắn đến users liên quan
4. **Connection Management**: Tự động join/leave rooms khi user connect/disconnect

## Troubleshooting

### Common Issues

1. **WebSocket connection failed**
   - Kiểm tra JWT token có hợp lệ không
   - Kiểm tra CORS configuration
   - Kiểm tra firewall/proxy settings

2. **Messages not received**
   - Kiểm tra user đã join đúng conversation room chưa
   - Kiểm tra user có quyền access conversation không

3. **Database errors**
   - Kiểm tra foreign key constraints
   - Kiểm tra unique constraints cho conversations

### Debug Commands

```bash
# Check WebSocket connections
curl -X GET http://localhost:8000/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test message sending
curl -X POST http://localhost:8000/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId": "123"}'
```
