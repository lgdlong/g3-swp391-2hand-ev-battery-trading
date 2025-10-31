import { io, Socket } from 'socket.io-client';

// WebSocket Event Types
export interface NewMessageEvent {
  id: string;
  content: string;
  senderId: number;
  conversationId: string;
  createdAt: Date;
  sender: {
    id: number;
    fullName: string;
  };
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface JoinConversationPayload {
  conversationId: string;
}

// Chat WebSocket Service
class ChatWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    // Connect to the backend WebSocket server
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = `${serverUrl}/chat`;

    console.log('🔌 Connecting to WebSocket:', wsUrl);

    this.socket = io(wsUrl, {
      forceNew: true,
      transports: ['websocket'],
      extraHeaders: {
        access_token: token,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to chat WebSocket');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from chat WebSocket:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Chat WebSocket connection error:', error);
      this.handleReconnection();
    });

    this.socket.on('error', (error) => {
      console.error('🔌 Chat WebSocket error:', error);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.socket?.connect();
      }, delay);
    }
  }

  // Event Listeners
  onNewMessage(callback: (message: NewMessageEvent) => void) {
    this.socket?.on('newMessage', callback);
  }

  onJoinedConversation(callback: (data: { conversationId: string }) => void) {
    this.socket?.on('joinedConversation', callback);
  }

  onLeftConversation(callback: (data: { conversationId: string }) => void) {
    this.socket?.on('leftConversation', callback);
  }

  // Event Emitters
  sendMessage(payload: SendMessagePayload) {
    this.socket?.emit('sendMessage', payload);
  }

  joinConversation(payload: JoinConversationPayload) {
    this.socket?.emit('joinConversation', payload);
  }

  leaveConversation(payload: JoinConversationPayload) {
    this.socket?.emit('leaveConversation', payload);
  }

  // Cleanup
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Utility
  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const chatWebSocketService = new ChatWebSocketService();
