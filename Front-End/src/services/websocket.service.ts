import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Message, MessageRequest } from '@/types/chat.type';

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(onMessageReceived: (message: Message) => void, onError?: (error: any) => void) {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Subscribe to messages
        this.client?.subscribe('/topic/messages', (message) => {
          const receivedMessage = JSON.parse(message.body) as Message;
          onMessageReceived(receivedMessage);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        this.isConnected = false;
        if (onError) {
          onError(frame);
        }
      },
      onWebSocketClose: () => {
        console.log('WebSocket Closed');
        this.isConnected = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        }
      },
    });

    this.client.activate();
  }

  subscribeToChatRoom(chatId: number, onMessageReceived: (message: Message) => void) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    return this.client.subscribe(`/topic/chat/${chatId}`, (message) => {
      const receivedMessage = JSON.parse(message.body) as Message;
      onMessageReceived(receivedMessage);
    });
  }

  sendMessage(messageRequest: MessageRequest) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(messageRequest),
    });
  }

  addUser(messageRequest: MessageRequest) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify(messageRequest),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('WebSocket Disconnected');
    }
  }

  isWebSocketConnected() {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();

