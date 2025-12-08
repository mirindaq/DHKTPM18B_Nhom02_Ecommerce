import { useEffect, useRef } from 'react';
import { webSocketService } from '@/services/websocket.service';
import type { NotificationResponse } from '@/types/notification.type';

interface UseDeliveryWebSocketOptions {
  onDeliveryNotification?: (notification: NotificationResponse) => void;
  enabled?: boolean;
  shipperId?: number;
}

export function useDeliveryWebSocket(options: UseDeliveryWebSocketOptions = {}) {
  const { onDeliveryNotification, enabled = true, shipperId } = options;
  const onNotificationRef = useRef(onDeliveryNotification);

  useEffect(() => {
    onNotificationRef.current = onDeliveryNotification;
  }, [onDeliveryNotification]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!webSocketService.isWebSocketConnected()) {
      webSocketService.connect(
        () => {
          webSocketService.subscribeToDeliveries((notification) => {
            onNotificationRef.current?.(notification);
          }, shipperId);
        },
        (error) => {
          console.error('WebSocket connection error:', error);
        }
      );
    } else {
      webSocketService.subscribeToDeliveries((notification) => {
        onNotificationRef.current?.(notification);
      }, shipperId);
    }

    return () => {
      webSocketService.unsubscribeFromDeliveries();
    };
  }, [enabled, shipperId]);

  return {
    isConnected: webSocketService.isWebSocketConnected(),
  };
}

