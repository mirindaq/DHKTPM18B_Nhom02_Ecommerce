package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.enums.OrderStatus;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.mappers.OrderMapper;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.OrderService;
import iuh.fit.ecommerce.services.PaymentService;
import iuh.fit.ecommerce.services.PromotionService;
import iuh.fit.ecommerce.utils.DateUtils;
import iuh.fit.ecommerce.utils.SecurityUtil;
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
    private final SecurityUtil securityUtil;
    private final CartRepository cartRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherCustomerRepository voucherCustomerRepository;
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionService promotionService;
    private final OrderMapper orderMapper;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public Object customerCreateOrder(OrderCreationRequest orderCreationRequest, HttpServletRequest request) {
        Customer customer = securityUtil.getCurrentCustomer();
        Cart cart = getCustomerCart(customer);

        validateCartNotEmpty(cart);

        Order order = buildOrder(orderCreationRequest, customer);

        List<OrderDetail> orderDetails = buildOrderDetails(cart, order, orderCreationRequest.getCartItemIds());
        double totalPrice = calculateTotalPrice(orderDetails);
        double totalDiscount = calculatePromotionDiscount(orderDetails);

        totalDiscount += applyRankingDiscount(customer, totalPrice - totalDiscount);

        Voucher voucher = getVoucherIfAvailable(orderCreationRequest);
        double voucherDiscountAmount = applyVoucherIfValid(voucher, customer, totalPrice, totalDiscount);

        double finalTotalPrice = totalPrice - (totalDiscount + voucherDiscountAmount);
        prepareOrderSummary(order, orderDetails, totalPrice, totalDiscount + voucherDiscountAmount, finalTotalPrice, orderCreationRequest);

        orderRepository.save(order);
        handleVoucherUsage(voucher, order, voucherDiscountAmount);

        return processPayment(orderCreationRequest, request, voucher, order, cart, orderCreationRequest.getCartItemIds());
    }

    @Override
    public ResponseWithPagination<List<OrderResponse>> getMyOrders(int page, int size, String status, String startDate, String endDate) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);
        Customer customer = securityUtil.getCurrentCustomer();

        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidParamException("Invalid status: " + status);
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


        Page<Order> ordersPage = orderRepository.findMyOrders(customer, orderStatus, start, endDt, pageable);
        return ResponseWithPagination.fromPage(ordersPage, orderMapper::toResponse);
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

    private Voucher getVoucherIfAvailable(OrderCreationRequest request) {
        if (request.getVoucherId() == null) return null;
        return voucherRepository.findById(request.getVoucherId())
                .orElseThrow(() -> new InvalidParamException("Voucher not found with id = " + request.getVoucherId()));
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

    private void prepareOrderSummary(Order order, List<OrderDetail> details, double totalPrice,
                                     double totalDiscount, double finalPrice, OrderCreationRequest request) {
        order.setOrderDetails(details);
        order.setTotalPrice(totalPrice);
        order.setTotalDiscount(totalDiscount);
        order.setFinalTotalPrice(finalPrice);
        order.setStatus(CASH_ON_DELIVERY.equals(request.getPaymentMethod()) ? PENDING : PENDING_PAYMENT);
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
        switch (orderCreationRequest.getPaymentMethod()) {
            case CASH_ON_DELIVERY -> {
                clearCart(cart, cartItemIds);
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                return orderMapper.toResponse(order);
            }
            case VN_PAY -> {
                updateVariantStockAfterOrderCreated(order.getOrderDetails());
                return paymentService.createPaymentUrl(voucher, order, cartItemIds, request);
            }
            case PAY_OS -> {
                // Todo: Xử lý thanh toán online (tạm thời chưa triển khai)
                throw new InvalidParamException("PAY_OS payment method not implemented yet");
            }
            default -> throw new InvalidParamException("Unsupported payment method");
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
}
