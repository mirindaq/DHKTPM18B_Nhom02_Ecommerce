import { useEffect, useRef } from 'react';
import { webSocketService } from '@/services/websocket.service';
import type { NotificationResponse } from '@/types/notification.type';

interface UseOrderWebSocketOptions {
  onOrderNotification?: (notification: NotificationResponse) => void;
  enabled?: boolean;
}

export function useOrderWebSocket(options: UseOrderWebSocketOptions = {}) {
  const { onOrderNotification, enabled = true } = options;
  const onNotificationRef = useRef(onOrderNotification);

  useEffect(() => {
    onNotificationRef.current = onOrderNotification;
  }, [onOrderNotification]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleNotification = (notification: NotificationResponse) => {
      onNotificationRef.current?.(notification);
    };

    const setupSubscription = () => {
      if (webSocketService.isWebSocketConnected()) {
        webSocketService.subscribeToOrders(handleNotification);
      } else {
        webSocketService.connect(
          () => {
            setTimeout(() => {
              webSocketService.subscribeToOrders(handleNotification);
            }, 100);
          },
          (error) => {
            console.error('WebSocket connection error:', error);
          }
        );
      }
    };

    setupSubscription();

    return () => {
      webSocketService.unsubscribeFromOrders();
    };
  }, [enabled]);

  return {
    isConnected: webSocketService.isWebSocketConnected(),
  };
}

