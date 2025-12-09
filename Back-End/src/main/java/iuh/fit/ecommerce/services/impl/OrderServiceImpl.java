package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.request.order.StaffOrderCreationRequest;
import iuh.fit.ecommerce.dtos.request.order.StaffOrderItem;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.enums.OrderStatus;
import iuh.fit.ecommerce.enums.PaymentMethod;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.OrderMapper;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.*;
import iuh.fit.ecommerce.utils.DateUtils;
import iuh.fit.ecommerce.specifications.OrderSpecification;
import iuh.fit.ecommerce.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static iuh.fit.ecommerce.enums.VoucherType.*;
import static iuh.fit.ecommerce.enums.OrderStatus.*;
import static iuh.fit.ecommerce.enums.PaymentMethod.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final SecurityUtils securityUtils;
    private final CartRepository cartRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherCustomerRepository voucherCustomerRepository;
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionService promotionService;
    private final OrderMapper orderMapper;
    private final PaymentService paymentService;
    private final RankingService rankingService;
    private final PushNotificationService pushNotificationService;
    private final CustomerService customerService;
    private final VoucherService voucherService;
    private final EmailService emailService;
    private final NotificationWebSocketService notificationWebSocketService;

    @Override
    @Transactional
    public Object customerCreateOrder(OrderCreationRequest request, HttpServletRequest httpRequest) {
        Customer customer = securityUtils.getCurrentCustomer();
        Cart cart = getCustomerCart(customer);

        validateCartNotEmpty(cart);

        Order order = buildOrder(request, customer);

        List<OrderDetail> orderDetails = buildOrderDetails(cart, order, request.getCartItemIds());
        double totalPrice = calculateTotalPrice(orderDetails);
        double totalDiscount = calculatePromotionDiscount(orderDetails);

        totalDiscount += applyRankingDiscount(customer, totalPrice - totalDiscount);

        Voucher voucher = request.getVoucherId() != null ? voucherService.getVoucherEntityById(request.getVoucherId()) : null;

        double voucherDiscountAmount = applyVoucherIfValid(voucher, customer, totalPrice, totalDiscount);

        double finalTotalPrice = totalPrice - (totalDiscount + voucherDiscountAmount);

        prepareOrderDetailAndPrice(order, orderDetails, totalPrice, totalDiscount, voucher, voucherDiscountAmount, finalTotalPrice, request.getPaymentMethod(), PENDING);

        return processPayment(request, httpRequest, voucher, order, cart, request.getCartItemIds());
    }


    @Override
    @Transactional
    public Object staffCreateOrder(StaffOrderCreationRequest request, HttpServletRequest httpRequest) {

        Order order = buildStaffOrder(request);
        Customer customer = order.getCustomer();

        List<OrderDetail> orderDetails = buildStaffOrderDetails(order, request.getItems());

        double totalPrice = calculateTotalPrice(orderDetails);
        double totalDiscount = calculatePromotionDiscount(orderDetails);

        double rankingDiscount = applyRankingDiscount(customer, totalPrice - totalDiscount);
        totalDiscount += rankingDiscount;

        Voucher voucher = request.getVoucherId() != null ? voucherService.getVoucherEntityById(request.getVoucherId()) : null;

        double voucherDiscountAmount = applyVoucherIfValid(voucher, customer, totalPrice, totalDiscount);
        
        double finalTotalPrice = totalPrice - totalDiscount - voucherDiscountAmount;

        prepareOrderDetailAndPrice(order, orderDetails, totalPrice, totalDiscount, voucher, voucherDiscountAmount, finalTotalPrice, request.getPaymentMethod(), PROCESSING);

        return processStaffPayment(request, httpRequest, order, voucher);
    }


    private void prepareOrderDetailAndPrice(Order order, List<OrderDetail> orderDetails, double totalPrice,
                                            double totalDiscount, Voucher voucher, double voucherDiscountAmount,
                                            double finalTotalPrice, PaymentMethod paymentMethod, OrderStatus orderStatus) {
        order.setOrderDetails(orderDetails);
        order.setTotalPrice(totalPrice);
        order.setTotalDiscount(totalDiscount + voucherDiscountAmount);
        order.setFinalTotalPrice(finalTotalPrice);

        order.setStatus(CASH_ON_DELIVERY.equals(paymentMethod) ? orderStatus : PENDING_PAYMENT);

        orderRepository.save(order);
        handleVoucherUsage(voucher, order, voucherDiscountAmount);
    }


    private Order buildStaffOrder(StaffOrderCreationRequest request) {
        Customer customer = customerService.getCustomerEntityById(request.getCustomerId());

        return Order.builder()
                .receiverName(request.getCustomerName())
                .receiverPhone(request.getCustomerPhone())
                .receiverAddress("Mua tại cửa hàng")
                .note(request.getNote())
                .isPickup(true)
                .paymentMethod(request.getPaymentMethod())
                .orderDate(LocalDateTime.now())
                .customer(customer)
                .build();
    }

    private List<OrderDetail> buildStaffOrderDetails(Order order, List<StaffOrderItem> items) {
        List<OrderDetail> details = new ArrayList<>();

        for (StaffOrderItem item : items) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + item.getProductVariantId()));

            int quantity = item.getQuantity();

            if (variant.getStock() == null || variant.getStock() < quantity) {
                throw new InvalidParamException(
                        String.format(
                                "Sản phẩm \"%s\" không đủ số lượng. Tồn kho hiện tại: %d, số lượng yêu cầu: %d",
                                variant.getProduct().getName(),
                                variant.getStock(),
                                quantity
                        )
                );
            }

            Promotion promotion = promotionService.getBestPromotionForVariant(variant);
            double discountPercent = promotion != null ? promotion.getDiscount() : 0.0;

            double price = variant.getPrice();
            double itemTotal = price * quantity;
            double discountAmount = itemTotal * discountPercent / 100.0;
            double finalPrice = itemTotal - discountAmount;

            details.add(OrderDetail.builder()
                    .order(order)
                    .productVariant(variant)
                    .price(price)
                    .quantity((long) quantity)
                    .discount(discountPercent)
                    .finalPrice(finalPrice)
                    .build());
        }

        return details;
    }

    private Object processStaffPayment(StaffOrderCreationRequest request, HttpServletRequest httpRequest, Order order, Voucher voucher) {
        String platform = "web";

        switch (request.getPaymentMethod()) {
            case CASH_ON_DELIVERY -> {
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                // Gửi WebSocket notification
                notificationWebSocketService.sendOrderNotification(
                    order, 
                    "CREATED", 
                    String.format("Đơn hàng mới #%d đã được tạo bởi staff", order.getId())
                );
                return orderMapper.toResponse(order);
            }
            case VN_PAY -> {
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                return ((PaymentServiceImpl) paymentService).createPaymentUrl(voucher, order, null, httpRequest, platform, true);
            }
            default -> throw new InvalidParamException("Unsupported payment method for staff order");
        }
    }


    @Override
    public ResponseWithPagination<List<OrderResponse>> getMyOrders(int page, int size, List<String> status, String startDate, String endDate) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);
        Customer customer = securityUtils.getCurrentCustomer();

        List<OrderStatus> orderStatuses = null;
        if (status != null && !status.isEmpty()) {
            orderStatuses = new ArrayList<>();
            for (String s : status) {
                try {
                    orderStatuses.add(OrderStatus.valueOf(s.trim().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new InvalidParamException("Invalid status: " + s);
                }
            }
        }

        LocalDateTime start = null;
        if (startDate != null && !startDate.isBlank()) {
            start = DateUtils.convertStringToLocalDate(startDate).atStartOfDay();
        }

        LocalDateTime endDt = null;
        if (endDate != null && !endDate.isBlank()) {
            endDt = DateUtils.convertStringToLocalDate(endDate).plusDays(1).atStartOfDay();
        }

        Page<Order> ordersPage = orderRepository.findMyOrders(customer, orderStatuses, start, endDt, pageable);
        return ResponseWithPagination.fromPage(ordersPage, orderMapper::toResponse);
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id = " + id));
    }

    private Cart getCustomerCart(Customer customer) {
        return cartRepository.findByCustomer_Id(customer.getId())
                .orElseThrow(() -> new InvalidParamException("Customer has no cart to create order"));
    }

    private void validateCartNotEmpty(Cart cart) {
        if (cart.getCartDetails().isEmpty()) {
            throw new InvalidParamException("Cart is empty");
        }
    }

    private Order buildOrder(OrderCreationRequest request, Customer customer) {
        return Order.builder()
                .receiverAddress(request.getReceiverAddress())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .note(request.getNote())
                .isPickup(request.getIsPickup())
                .paymentMethod(request.getPaymentMethod())
                .orderDate(LocalDateTime.now())
                .customer(customer)
                .build();
    }

    private List<OrderDetail> buildOrderDetails(Cart cart, Order order, List<Long> cartItemIds) {
        List<OrderDetail> details = new ArrayList<>();

        List<CartDetail> selectedItems = cart.getCartDetails().stream()
                .filter(cd -> cartItemIds.contains(cd.getId()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new InvalidParamException("No valid cart items found to create order");
        }

        for (CartDetail cartDetail : selectedItems) {
            ProductVariant variant = cartDetail.getProductVariant();
            double price = cartDetail.getPrice();
            long quantity = cartDetail.getQuantity();

            if (variant.getStock() == null || variant.getStock() < quantity) {
                throw new InvalidParamException(
                        String.format(
                                "Sản phẩm \"%s\" không đủ số lượng. Tồn kho hiện tại: %d, số lượng yêu cầu: %d",
                                variant.getProduct().getName(),
                                variant.getStock(),
                                quantity
                        )
                );
            }

            Promotion promotion = promotionService.getBestPromotionForVariant(variant);
            double discountPercent = promotion != null ? promotion.getDiscount() : 0.0;

            double itemTotal = price * quantity;
            double discountAmount = itemTotal * discountPercent / 100.0;
            double finalPrice = itemTotal - discountAmount;

            details.add(OrderDetail.builder()
                    .order(order)
                    .productVariant(variant)
                    .price(price)
                    .quantity(quantity)
                    .discount(discountPercent)
                    .finalPrice(finalPrice)
                    .build());
        }

        return details;
    }

    private double calculateTotalPrice(List<OrderDetail> orderDetails) {
        return orderDetails.stream().mapToDouble(d -> d.getPrice() * d.getQuantity()).sum();
    }

    private double calculatePromotionDiscount(List<OrderDetail> orderDetails) {
        return orderDetails.stream().mapToDouble(d -> {
            double total = d.getPrice() * d.getQuantity();
            return total * (d.getDiscount() / 100.0);
        }).sum();
    }

    private double applyRankingDiscount(Customer customer, double currentAmount) {
        Ranking ranking = customer.getRanking();
        if (ranking == null || ranking.getDiscountRate() == null || ranking.getDiscountRate() <= 0) return 0.0;
        return currentAmount * (ranking.getDiscountRate() / 100.0);
    }


    private double applyVoucherIfValid(Voucher voucher, Customer customer, double totalPrice, double totalDiscount) {
        if (voucher == null) return 0.0;

        double baseAmount = totalPrice - totalDiscount;
        validateVoucher(voucher, customer, baseAmount);

        double discountAmount = baseAmount * (voucher.getDiscount() / 100.0);
        if (voucher.getMaxDiscountAmount() != null && discountAmount > voucher.getMaxDiscountAmount()) {
            discountAmount = voucher.getMaxDiscountAmount();
        }
        return discountAmount;
    }



    private void handleVoucherUsage(Voucher voucher, Order order, double discountAmount) {
        if (voucher == null) return;

        VoucherUsageHistory history = VoucherUsageHistory.builder()
                .voucher(voucher)
                .order(order)
                .discountAmount(discountAmount)
                .build();

        voucherUsageHistoryRepository.save(history);
    }

    private Object processPayment(OrderCreationRequest orderCreationRequest, HttpServletRequest request,
                                  Voucher voucher, Order order, Cart cart, List<Long> cartItemIds) {
        String platform = orderCreationRequest.getPlatform();
        switch (orderCreationRequest.getPaymentMethod()) {
            case CASH_ON_DELIVERY -> {
                clearCart(cart, cartItemIds);
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                // Gửi email xác nhận đơn hàng
                sendOrderConfirmationEmail(order);
                // Gửi WebSocket notification
                notificationWebSocketService.sendOrderNotification(
                    order, 
                    "CREATED", 
                    String.format("Đơn hàng mới #%d đã được tạo", order.getId())
                );
                return orderMapper.toResponse(order);
            }
            case VN_PAY -> {
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                return paymentService.createPaymentUrl(voucher, order, cartItemIds, request, platform);
            }
            case PAY_OS -> {
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                return paymentService.createPayOsPaymentUrl(voucher, order, cartItemIds, platform);
            }
            default -> throw new InvalidParamException("Unsupported payment method");
        }
    }

    private void sendOrderConfirmationEmail(Order order) {
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail != null && !customerEmail.isBlank()) {
                // Fetch order with all necessary data for email to avoid lazy loading issues
                Order orderWithDetails = orderRepository.findByIdWithDetailsForEmail(order.getId());
                if (orderWithDetails != null) {
                    emailService.sendOrderConfirmation(customerEmail, orderWithDetails);
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the order
            // Email is sent asynchronously, so this won't block
        }
    }

    private void clearCart(Cart cart, List<Long> cartItemIds) {
        cart.getCartDetails().removeIf(cd -> cartItemIds.contains(cd.getId()));
        cart.setTotalItems((long) cart.getCartDetails().size());
        cartRepository.save(cart);
    }

    private void updateVariantStockAfterOrderCreated(List<OrderDetail> orderDetails) {
        orderDetails.forEach(detail -> {
            ProductVariant variant = detail.getProductVariant();
            int newStock = variant.getStock() - detail.getQuantity().intValue();
            variant.setStock(newStock);
            productVariantRepository.save(variant);
        });
    }

    private void validateVoucher(Voucher voucher, Customer customer, double currentAmount) {
        if (!ALL.equals(voucher.getVoucherType())) {
            boolean assigned = voucherCustomerRepository.existsByVoucherAndCustomer(voucher, customer);
            if (!assigned) throw new InvalidParamException("Voucher not assigned to this customer");
        }

        boolean used = voucherUsageHistoryRepository.existsByVoucherAndOrder_Customer(voucher, customer);
        if (used) throw new InvalidParamException("Voucher already used by this customer");

        LocalDate today = LocalDate.now();
        if (today.isBefore(voucher.getStartDate()) || today.isAfter(voucher.getEndDate())) {
            throw new InvalidParamException("Voucher expired or not active");
        }

        if (voucher.getMinOrderAmount() != null && currentAmount < voucher.getMinOrderAmount()) {
            throw new InvalidParamException("Order does not meet minimum amount for voucher");
        }
    }

    @Override
    public ResponseWithPagination<List<OrderResponse>> getAllOrdersForAdmin(
            String customerName,
            LocalDate orderDate,
            String customerPhone,
            OrderStatus status,
            Boolean isPickup,
            int page,
            int size
    ) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);

        Page<Order> orderPage = orderRepository.findAll(
                OrderSpecification.filterOrders(customerName, orderDate, customerPhone, status, isPickup),
                pageable
        );

        return ResponseWithPagination.fromPage(orderPage, orderMapper::toResponse);
    }

    @Override
    public OrderResponse getOrderDetailById(Long id) {
        Order order = findById(id);
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = findById(orderId);

        if (!PENDING.equals(order.getStatus())) {
            throw new InvalidParamException(
                    String.format("Cannot confirm order with status: %s", order.getStatus())
            );
        }

        order.setStatus(PROCESSING);
        orderRepository.save(order);

        sendOrderStatusNotification(order, PROCESSING, "Đơn hàng đã được tiếp nhận", 
                String.format("Đơn hàng #%d của bạn đã được tiếp nhận và đang được xử lý.", order.getId()));
        
        // Gửi WebSocket notification
        notificationWebSocketService.sendOrderNotification(
            order, 
            "UPDATED", 
            String.format("Đơn hàng #%d đã được tiếp nhận", order.getId())
        );

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = findById(orderId);

        if (!PENDING.equals(order.getStatus())
                && !PROCESSING.equals(order.getStatus())
                && !READY_FOR_PICKUP.equals(order.getStatus())) {
            throw new InvalidParamException(
                    String.format("Cannot cancel order with status: %s", order.getStatus())
            );
        }

        restoreProductStock(order.getOrderDetails());
        restoreVoucher(order);

        order.setStatus(CANCELED);
        orderRepository.save(order);

        sendOrderStatusNotification(order, CANCELED, "Đơn hàng đã bị hủy", 
                String.format("Đơn hàng #%d của bạn đã bị hủy.", order.getId()));
        
        // Gửi WebSocket notification
        notificationWebSocketService.sendOrderNotification(
            order, 
            "CANCELLED", 
            String.format("Đơn hàng #%d đã bị hủy", order.getId())
        );

        return orderMapper.toResponse(order);
    }

    private void restoreProductStock(List<OrderDetail> orderDetails) {
        orderDetails.forEach(detail -> {
            ProductVariant variant = detail.getProductVariant();
            int newStock = variant.getStock() + detail.getQuantity().intValue();
            variant.setStock(newStock);
            productVariantRepository.save(variant);
        });
    }

    private void restoreVoucher(Order order) {
        if (voucherUsageHistoryRepository.existsByOrder(order)) {
            voucherUsageHistoryRepository.deleteByOrder(order);
        }
    }

    @Override
    @Transactional
    public OrderResponse processOrder(Long orderId) {
        Order order = findById(orderId);

        if (!PROCESSING.equals(order.getStatus())) {
            throw new InvalidParamException(
                    String.format("Cannot process order with status: %s", order.getStatus())
            );
        }

        OrderStatus newStatus = Boolean.TRUE.equals(order.getIsPickup()) ? READY_FOR_PICKUP : SHIPPED;

        order.setStatus(newStatus);
        orderRepository.save(order);

        if (READY_FOR_PICKUP.equals(newStatus)) {
            sendOrderStatusNotification(order, READY_FOR_PICKUP, "Đơn hàng sẵn sàng nhận", 
                    String.format("Đơn hàng #%d của bạn đã sẵn sàng để nhận. Vui lòng đến cửa hàng để nhận hàng.", order.getId()));
        } else {
            sendOrderStatusNotification(order, SHIPPED, "Đơn hàng đang được giao", 
                    String.format("Đơn hàng #%d của bạn đang được giao đến địa chỉ của bạn.", order.getId()));
        }
        
        // Gửi WebSocket notification
        notificationWebSocketService.sendOrderNotification(
            order, 
            "PROCESSED", 
            String.format("Đơn hàng #%d đã được xử lý", order.getId())
        );

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(Long orderId) {
        Order order = findById(orderId);

        if (!READY_FOR_PICKUP.equals(order.getStatus())) {
            throw new InvalidParamException(
                    String.format("Cannot complete order with status: %s", order.getStatus())
            );
        }

        order.setStatus(COMPLETED);
        orderRepository.save(order);

        rankingService.updateCustomerRanking(order);

        sendOrderStatusNotification(order, COMPLETED, "Đơn hàng đã được nhận", 
                String.format("Đơn hàng #%d của bạn đã được hoàn thành. Cảm ơn bạn đã mua sắm!", order.getId()));
        
        // Gửi WebSocket notification
        notificationWebSocketService.sendOrderNotification(
            order, 
            "COMPLETED", 
            String.format("Đơn hàng #%d đã hoàn thành", order.getId())
        );

        return orderMapper.toResponse(order);
    }

    @Override
    public ResponseWithPagination<List<OrderResponse>> getOrdersNeedShipper(int page, int size) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);

        Page<Order> orderPage = orderRepository.findAll(
                OrderSpecification.filterOrders(null, null, null, SHIPPED, false),
                pageable
        );

        return ResponseWithPagination.fromPage(orderPage, orderMapper::toResponse);
    }

    private void sendOrderStatusNotification(Order order, OrderStatus status, String title, String body) {
        Customer customer = order.getCustomer();
        if (customer == null) return;

        String expoPushToken = customer.getExpoPushToken();
        if (expoPushToken == null || expoPushToken.isEmpty()) {
            return;
        }

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("orderId", order.getId());
        notificationData.put("type", "order_status");
        notificationData.put("status", status.name());

        pushNotificationService.sendPushNotification(
                expoPushToken,
                title,
                body,
                notificationData
        );
    }
}
