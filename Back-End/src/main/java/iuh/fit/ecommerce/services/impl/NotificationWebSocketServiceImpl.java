package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.NotificationResponse;
import iuh.fit.ecommerce.entities.DeliveryAssignment;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.services.NotificationWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationWebSocketServiceImpl implements NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String ORDER_TOPIC = "/topic/orders";
    private static final String DELIVERY_TOPIC = "/topic/deliveries";
    private static final String SHIPPER_DELIVERY_TOPIC_PREFIX = "/topic/shipper/";

    @Override
    public void sendOrderNotification(Order order, String action, String message) {
        try {
            NotificationResponse notification = NotificationResponse.builder()
                    .type("ORDER")
                    .orderId(order.getId())
                    .orderStatus(order.getStatus() != null ? order.getStatus().name() : null)
                    .action(action)
                    .message(message)
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSend(ORDER_TOPIC, notification);
            log.info("Order notification sent: OrderId={}, Action={}, Status={}", 
                    notification.getOrderId(), notification.getAction(), notification.getOrderStatus());
        } catch (Exception e) {
            log.error("Error sending order notification for order {}: {}", order.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void sendDeliveryNotification(DeliveryAssignment deliveryAssignment, String action, String message) {
        try {
            NotificationResponse notification = NotificationResponse.builder()
                    .type("DELIVERY")
                    .deliveryAssignmentId(deliveryAssignment.getId())
                    .orderId(deliveryAssignment.getOrder().getId())
                    .shipperId(deliveryAssignment.getShipper().getId())
                    .deliveryStatus(deliveryAssignment.getDeliveryStatus() != null ? deliveryAssignment.getDeliveryStatus().name() : null)
                    .action(action)
                    .message(message)
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSend(DELIVERY_TOPIC, notification);
            
            if (notification.getShipperId() != null) {
                messagingTemplate.convertAndSend(
                    SHIPPER_DELIVERY_TOPIC_PREFIX + notification.getShipperId(), 
                    notification
                );
            }
            
            log.info("Delivery notification sent: DeliveryAssignmentId={}, OrderId={}, ShipperId={}, Action={}", 
                    notification.getDeliveryAssignmentId(), 
                    notification.getOrderId(),
                    notification.getShipperId(),
                    notification.getAction());
        } catch (Exception e) {
            log.error("Error sending delivery notification for delivery assignment {}: {}", 
                    deliveryAssignment.getId(), e.getMessage(), e);
        }
    }
}

