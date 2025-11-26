import { io, Socket } from 'socket.io-client';
import { Account } from '@/types/chat';

// WebSocket Event Types
export interface NewMessageEvent {
  id: string;
  content: string;
  senderId: number;
  conversationId: string;
  createdAt: Date;
  sender: Account;
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
  private currentToken: string | null = null;
  private lastConnectionAttempt = 0;
  private minConnectionInterval = 1000; // Minimum 1 second between connection attempts

  connect(token: string) {
    // Rate limiting: prevent too frequent connection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.minConnectionInterval) {
      return;
    }
    this.lastConnectionAttempt = now;

    // If token changed, disconnect and reconnect with new token
    if (this.currentToken !== token && this.socket?.connected) {
      this.disconnect();
    }

    this.currentToken = token;

    if (this.socket?.connected) {
      return;
    }

    // Reset reconnection settings for new connection attempt
    this.resetReconnectionSettings();

    // Connect to the backend WebSocket server
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = `${serverUrl}/chat`;

    this.socket = io(wsUrl, {
      forceNew: true,
      transports: ['websocket', 'polling'], // Allow fallback to polling
      timeout: 20000, // 20 second timeout
      auth: {
        token: token,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      } else if (reason === 'transport close') {
        // Don't auto-reconnect for transport close as it might be auth-related
        console.warn('🔌 Not attempting reconnection due to transport close (likely auth issue)');
      } else if (reason === 'transport error') {
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Chat WebSocket connection error:', error);

      // Check if it's an authentication error
      if (error.message && error.message.includes('authentication')) {
        console.error('🔌 Authentication error detected, not attempting reconnection');
        this.forceDisconnect(); // Use force disconnect to stop reconnection attempts
        return;
      }

      this.handleReconnection();
    });

    this.socket.on('error', (error: any) => {
      console.error('🔌 Chat WebSocket error:', error);

      // Log error details for debugging
      if (error.message) {
        console.error('🔌 Error message:', error.message);
      }
      if (error.type) {
        console.error('🔌 Error type:', error.type);
      }

      // Check if it's an authentication error
      if (
        error.message &&
        (error.message.includes('Authentication failed') ||
          error.message.includes('JWT token required') ||
          error.message.includes('Unauthorized'))
      ) {
        console.error(
          '🔌 Authentication error from server, disconnecting and stopping reconnection',
        );
        this.forceDisconnect(); // Use force disconnect to stop reconnection attempts
        return;
      }
    });
  }

  private handleReconnection() {
    // Don't attempt reconnection if max attempts is 0 (disabled due to auth errors)
    if (this.maxReconnectAttempts === 0) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentToken) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      setTimeout(() => {
        if (this.currentToken) {
          // Reconnect with stored token
          this.connect(this.currentToken);
        }
      }, delay);
    }
  }

  // Event Listeners with cleanup functions
  onConnect(callback: () => void): () => void {
    this.socket?.on('connect', callback);
    return () => this.socket?.off('connect', callback);
  }

  onDisconnect(callback: (reason: string) => void): () => void {
    this.socket?.on('disconnect', callback);
    return () => this.socket?.off('disconnect', callback);
  }

  onNewMessage(callback: (message: NewMessageEvent) => void): () => void {
    this.socket?.on('newMessage', callback);
    return () => this.socket?.off('newMessage', callback);
  }

  onJoinedConversation(callback: (data: { conversationId: string }) => void): () => void {
    this.socket?.on('joinedConversation', callback);
    return () => this.socket?.off('joinedConversation', callback);
  }

  onLeftConversation(callback: (data: { conversationId: string }) => void): () => void {
    this.socket?.on('leftConversation', callback);
    return () => this.socket?.off('leftConversation', callback);
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
    this.currentToken = null; // Clear stored token
    this.reconnectAttempts = 0; // Reset reconnection attempts
  }

  // Force disconnect and prevent reconnection (for auth errors)
  forceDisconnect() {
    this.maxReconnectAttempts = 0; // Prevent further reconnection attempts
    this.disconnect();
  }

  // Reset reconnection settings (call when user logs in again)
  resetReconnectionSettings() {
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
  }

  // Utility
  get isConnected() {
    return this.socket?.connected ?? false;
  }

  // Get socket instance for direct event listening
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const chatWebSocketService = new ChatWebSocketService();
