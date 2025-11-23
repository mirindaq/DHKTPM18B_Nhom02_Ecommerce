package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.deliveryAssignment.AssignShipperRequest;
import iuh.fit.ecommerce.dtos.request.deliveryAssignment.CompleteDeliveryRequest;
import iuh.fit.ecommerce.dtos.response.deliveryAssignment.DeliveryAssignmentResponse;
import iuh.fit.ecommerce.entities.DeliveryAssignment;
import iuh.fit.ecommerce.entities.DeliveryImage;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.enums.DeliveryStatus;
import iuh.fit.ecommerce.enums.OrderStatus;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.exceptions.custom.UnauthorizedException;
import iuh.fit.ecommerce.mappers.DeliveryAssignmentMapper;
import iuh.fit.ecommerce.repositories.DeliveryAssignmentRepository;
import iuh.fit.ecommerce.repositories.DeliveryImageRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.services.DeliveryAssignmentService;
import iuh.fit.ecommerce.services.OrderService;
import iuh.fit.ecommerce.services.StaffService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static iuh.fit.ecommerce.enums.OrderStatus.SHIPPED;

@Service
@RequiredArgsConstructor
public class DeliveryAssignmentServiceImpl implements DeliveryAssignmentService {
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final StaffService staffService;
    private final DeliveryImageRepository deliveryImageRepository;
    private final SecurityUtils securityUtils;
    private final DeliveryAssignmentMapper deliveryAssignmentMapper;

    @Override
    public void assignShipperToOrder(AssignShipperRequest request) {
        Staff leader = securityUtils.getCurrentStaff();

        if(leader.getLeader() == null || !leader.getLeader()) {
            throw new InvalidParamException("Only team leaders can assign shippers to orders");
        }

        Order order = orderService.findById(request.getOrderId());

        if (!SHIPPED.equals(order.getStatus())) {
            throw new InvalidParamException("Order must be in SHIPPED status to assign shipper");
        }

        Staff shipper = staffService.getStaffEntityById(request.getShipperId());

        boolean isDelivering = deliveryAssignmentRepository.existsByShipperAndDeliveryStatus(
                shipper, DeliveryStatus.DELIVERING);

        if (isDelivering) {
            throw new InvalidParamException("Shipper #" + shipper.getId() + " (" + shipper.getFullName() + ") is currently delivering another order");
        }

        Optional<DeliveryAssignment> existingAssignment = deliveryAssignmentRepository.findByOrder_Id(order.getId());

        if(existingAssignment.isPresent()) {
            throw new InvalidParamException("Order already has a shipper assigned");
        }

        DeliveryAssignment deliveryAssignment = DeliveryAssignment.builder()
                .order(order)
                .shipper(shipper)
                .deliveryStatus(DeliveryStatus.ASSIGNED)
                .expectedDeliveryDate(LocalDate.now().plusDays(3))
                .build();

        deliveryAssignment.setDeliveryStatus(DeliveryStatus.ASSIGNED);
        deliveryAssignmentRepository.save(deliveryAssignment);

        // Cập nhật status order thành ASSIGNED_SHIPPER
        order.setStatus(OrderStatus.ASSIGNED_SHIPPER);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void startDelivery(Long deliveryAssignmentId) {
        DeliveryAssignment deliveryAssignment = findById(deliveryAssignmentId);
        Staff currentStaff = securityUtils.getCurrentStaff();

        if (!deliveryAssignment.getShipper().getId().equals(currentStaff.getId())) {
            throw new UnauthorizedException("You are not assigned to this delivery");
        }

        if (!DeliveryStatus.ASSIGNED.equals(deliveryAssignment.getDeliveryStatus())) {
            throw new InvalidParamException("Delivery must be in ASSIGNED status to start");
        }

        boolean isCurrentlyDelivering = deliveryAssignmentRepository.existsByShipperAndDeliveryStatus(
                currentStaff, DeliveryStatus.DELIVERING);

        if (isCurrentlyDelivering) {
            throw new InvalidParamException("You are currently delivering another order. Please complete it first.");
        }

        deliveryAssignment.setDeliveryStatus(DeliveryStatus.DELIVERING);
        deliveryAssignmentRepository.save(deliveryAssignment);

        Order order = deliveryAssignment.getOrder();
        order.setStatus(OrderStatus.DELIVERING);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void completeDelivery(CompleteDeliveryRequest request) {
        DeliveryAssignment deliveryAssignment = findById(request.getDeliveryAssignmentId());

        Staff currentStaff = securityUtils.getCurrentStaff();

        if (!deliveryAssignment.getShipper().getId().equals(currentStaff.getId())) {
            throw new UnauthorizedException("You are not assigned to this delivery");
        }

        if (!DeliveryStatus.DELIVERING.equals(deliveryAssignment.getDeliveryStatus())) {
            throw new InvalidParamException("Delivery must be in DELIVERING status to complete");
        }

        if (Boolean.TRUE.equals(request.getSuccess())) {
            deliveryAssignment.setDeliveryStatus(DeliveryStatus.DELIVERED);
            deliveryAssignment.getOrder().setStatus(OrderStatus.COMPLETED);
        } else {
            deliveryAssignment.setDeliveryStatus(DeliveryStatus.FAILED);
            deliveryAssignment.getOrder().setStatus(OrderStatus.FAILED);
        }

        deliveryAssignment.setNote(request.getNote());
        deliveryAssignment.setDeliveredAt(LocalDateTime.now());

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<DeliveryImage> images = request.getImageUrls().stream()
                    .map(url -> DeliveryImage.builder()
                            .imageUrl(url)
                            .deliveryAssignment(deliveryAssignment)
                            .build())
                    .collect(Collectors.toList());
            deliveryImageRepository.saveAll(images);
        }

        deliveryAssignmentRepository.save(deliveryAssignment);
        orderRepository.save(deliveryAssignment.getOrder());
    }

    private DeliveryAssignment findById(Long id) {
        return deliveryAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery assignment not found with id: " + id));
    }

    @Override
    public DeliveryAssignmentResponse getDeliveryAssignmentById(Long id) {
        DeliveryAssignment deliveryAssignment = findById(id);
        return deliveryAssignmentMapper.toResponse(deliveryAssignment);
    }

    @Override
    public List<DeliveryAssignmentResponse> getMyDeliveries() {
        Staff currentStaff = securityUtils.getCurrentStaff();
        List<DeliveryAssignment> deliveries = deliveryAssignmentRepository.findByShipper(currentStaff);
        return deliveries.stream()
                .map(deliveryAssignmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeliveryAssignmentResponse> getMyDeliveringOrders() {
        Staff currentStaff = securityUtils.getCurrentStaff();
        List<DeliveryAssignment> deliveringOrders = deliveryAssignmentRepository
                .findByShipperAndDeliveryStatus(currentStaff, DeliveryStatus.DELIVERING);
        return deliveringOrders.stream()
                .map(deliveryAssignmentMapper::toResponse)
                .collect(Collectors.toList());
    }
}