import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Message, MessageRequest } from '@/types/chat.type';
import type { NotificationResponse } from '@/types/notification.type';

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscriptions: Map<number, any[]> = new Map();
  private orderSubscription: any | null = null;
  private deliverySubscription: any | null = null;
  private shipperDeliverySubscription: any | null = null;

  connect(onConnected?: () => void, onError?: (error: any) => void) {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      onConnected?.();
      return;
    }

    if (this.client && this.client.active) {
      console.log('WebSocket connection in progress...');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        onConnected?.();
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

    const subscription = this.client.subscribe(`/topic/chat/${chatId}`, (message) => {
      const receivedMessage = JSON.parse(message.body) as Message;
      onMessageReceived(receivedMessage);
    });

    if (!this.subscriptions.has(chatId)) {
      this.subscriptions.set(chatId, []);
    }
    this.subscriptions.get(chatId)?.push(subscription);

    console.log(`Subscribed to chat ${chatId}, total subscriptions: ${this.subscriptions.get(chatId)?.length}`);

    return subscription;
  }

  subscribeToMultipleChats(chatIds: number[], onMessageReceived: (message: Message) => void) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    chatIds.forEach(chatId => {
      this.subscribeToChatRoom(chatId, onMessageReceived);
    });
  }

  unsubscribeFromChat(chatId: number) {
    const subscriptions = this.subscriptions.get(chatId);
    if (subscriptions) {
      subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.delete(chatId);
    }
  }

  unsubscribeFromAllChats() {
    this.subscriptions.forEach(subscriptions => {
      subscriptions.forEach(sub => sub.unsubscribe());
    });
    this.subscriptions.clear();
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

  subscribeToOrders(onOrderNotification: (notification: NotificationResponse) => void) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected, cannot subscribe to orders');
      return;
    }

    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }

    this.orderSubscription = this.client.subscribe('/topic/orders', (message) => {
      try {
        const notification = JSON.parse(message.body) as NotificationResponse;
        if (notification.type === 'ORDER') {
          onOrderNotification(notification);
        }
      } catch (error) {
        console.error('Error parsing order notification:', error);
      }
    });

    return this.orderSubscription;
  }

  unsubscribeFromOrders() {
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
      this.orderSubscription = null;
      console.log('Unsubscribed from orders topic');
    }
  }

  subscribeToDeliveries(onDeliveryNotification: (notification: NotificationResponse) => void, shipperId?: number) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    if (this.deliverySubscription) {
      this.deliverySubscription.unsubscribe();
    }
    if (this.shipperDeliverySubscription) {
      this.shipperDeliverySubscription.unsubscribe();
    }

    this.deliverySubscription = this.client.subscribe('/topic/deliveries', (message) => {
      const notification = JSON.parse(message.body) as NotificationResponse;
      if (notification.type === 'DELIVERY') {
        onDeliveryNotification(notification);
      }
    });

    if (shipperId) {
      this.shipperDeliverySubscription = this.client.subscribe(`/topic/shipper/${shipperId}`, (message) => {
        const notification = JSON.parse(message.body) as NotificationResponse;
        if (notification.type === 'DELIVERY') {
          onDeliveryNotification(notification);
        }
      });
    }

    console.log('Subscribed to deliveries topic');
    return this.deliverySubscription;
  }

  unsubscribeFromDeliveries() {
    if (this.deliverySubscription) {
      this.deliverySubscription.unsubscribe();
      this.deliverySubscription = null;
    }
    if (this.shipperDeliverySubscription) {
      this.shipperDeliverySubscription.unsubscribe();
      this.shipperDeliverySubscription = null;
    }
    console.log('Unsubscribed from deliveries topic');
  }

  disconnect() {
    if (this.client) {
      this.unsubscribeFromAllChats();
      this.unsubscribeFromOrders();
      this.unsubscribeFromDeliveries();
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

