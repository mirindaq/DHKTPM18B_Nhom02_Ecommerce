package iuh.fit.ecommerce.services;


import iuh.fit.ecommerce.dtos.request.deliveryAssignment.AssignShipperRequest;
import iuh.fit.ecommerce.dtos.request.deliveryAssignment.CompleteDeliveryRequest;
import iuh.fit.ecommerce.dtos.response.deliveryAssignment.DeliveryAssignmentResponse;

import java.util.List;

public interface DeliveryAssignmentService {
    void assignShipperToOrder(AssignShipperRequest assignShipperRequest);

    void startDelivery(Long deliveryAssignmentId);

    void completeDelivery(CompleteDeliveryRequest completeDeliveryRequest);

    DeliveryAssignmentResponse getDeliveryAssignmentById(Long id);

    List<DeliveryAssignmentResponse> getMyDeliveries();

    List<DeliveryAssignmentResponse> getMyDeliveringOrders();
}