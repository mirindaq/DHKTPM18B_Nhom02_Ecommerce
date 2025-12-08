package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.NotificationResponse;
import iuh.fit.ecommerce.entities.DeliveryAssignment;
import iuh.fit.ecommerce.entities.Order;

public interface NotificationWebSocketService {
    void sendOrderNotification(Order order, String action, String message);
    void sendDeliveryNotification(DeliveryAssignment deliveryAssignment, String action, String message);
}

