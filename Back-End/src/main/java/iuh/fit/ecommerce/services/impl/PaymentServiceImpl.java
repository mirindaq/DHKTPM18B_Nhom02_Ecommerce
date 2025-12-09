package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.EmailService;
import iuh.fit.ecommerce.services.NotificationWebSocketService;
import iuh.fit.ecommerce.services.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import static iuh.fit.ecommerce.enums.OrderStatus.*;

import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.PaymentLink;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    @Value("${payment.vnPay.url}")
    private String vnp_PayUrl;
    @Value("${payment.vnPay.returnUrl}")
    private String vnp_ReturnUrl;
    @Value("${payment.vnPay.tmnCode}")
    private String vnp_TmnCode ;
    @Value("${payment.vnPay.secretKey}")
    private String secretKey;
    @Value("${payment.vnPay.version}")
    private String vnp_Version;
    @Value("${payment.vnPay.command}")
    private String vnp_Command;
    @Value("${payment.vnPay.orderType}")
    private String orderType;
    @Value("${domain.frontend}")
    private String domainFrontend;
    @Value("${domain.frontend-staff}")
    private String domainFrontendStaff;
    @Value("${payment.pay_os.return-url}")
    private String payOsReturnUrl;
    @Value("${payment.pay_os.cancel-url}")
    private String payOsCancelUrl;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final OrderRepository orderRepository;
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final VoucherRepository voucherRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PayOS payOS;
    private final EmailService emailService;
    private final NotificationWebSocketService notificationWebSocketService;
    private final int TIME_OUT = 15;

    @Override
    public String createPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, HttpServletRequest request, String platform) {
        return createPaymentUrl(voucher, order, cartItemIds, request, platform, false);
    }

    public String createPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, HttpServletRequest request, String platform, boolean isStaffOrder) {
        long amount = order.getFinalTotalPrice().longValue() * 100L;
        Map<String, String> vnpParamsMap = getVNPayConfig();

        long voucherId = voucher != null ? voucher.getId() : 0;

        vnpParamsMap.put("vnp_ReturnUrl", this.vnp_ReturnUrl + "?orderId=" + order.getId() +
                "&voucherId=" + voucherId +
                "&cartItemIds=" + (cartItemIds != null ? cartItemIds.stream().map(String::valueOf).collect(Collectors.joining(",")) : "") +
                "&platform=" + (platform != null ? platform : "web") +
                "&isStaffOrder=" + isStaffOrder);

        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        vnpParamsMap.put("vnp_IpAddr",getIpAddress(request));

        //build query url
        String queryUrl = getPaymentURL(vnpParamsMap, true);
        String hashData = getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = hmacSHA512(secretKey, hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        scheduleRevokeJob(voucher, order.getId(), TIME_OUT + 1);

        return vnp_PayUrl + "?" + queryUrl;
    }

    public void scheduleRevokeJob(Voucher voucher, Long orderId, int delayMinutes) {
        scheduler.schedule(() -> {
            Order order = orderRepository.findById(orderId).orElse(null);
            if(order != null && PENDING_PAYMENT.equals(order.getStatus())) {
                order.setStatus(PAYMENT_FAILED);
                orderRepository.save(order);

                restoreVariantStock(order);
                if(voucher != null){
                    voucherUsageHistoryRepository.deleteByVoucherAndOrder(voucher, order);
                }
            }
        }, delayMinutes, TimeUnit.MINUTES);
    }

    @Override
    public void handlePaymentCallBack(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String status = request.getParameter("vnp_ResponseCode");
        Long orderId = Long.parseLong(request.getParameter("orderId"));
        long voucherId = Long.parseLong(request.getParameter("voucherId"));

        String cartItemsIdsString = request.getParameter("cartItemIds");
        List<Long> cartItemIds = cartItemsIdsString.isEmpty() ? new ArrayList<>() :
                Arrays.stream(cartItemsIdsString.split(","))
                .map(Long::parseLong)
                .toList();
        String platform = request.getParameter("platform");
        boolean isStaffOrder = "true".equals(request.getParameter("isStaffOrder"));

        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String redirectUrl;
        if ("mobile".equals(platform)) {
            redirectUrl = String.format(
                    "ecom-store://payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                    request.getParameter("vnp_ResponseCode"),
                    request.getParameter("orderId"),
                    request.getParameter("vnp_TransactionNo"),
                    request.getParameter("vnp_TxnRef"),
                    request.getParameter("vnp_Amount"),
                    request.getParameter("vnp_BankCode"),
                    request.getParameter("vnp_PayDate")
            );
        } else if (isStaffOrder) {
            redirectUrl = String.format(
                    "%s/payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                    domainFrontendStaff,
                    request.getParameter("vnp_ResponseCode"),
                    request.getParameter("orderId"),
                    request.getParameter("vnp_TransactionNo"),
                    request.getParameter("vnp_TxnRef"),
                    request.getParameter("vnp_Amount"),
                    request.getParameter("vnp_BankCode"),
                    request.getParameter("vnp_PayDate")
            );
        } else {
            redirectUrl = String.format(
                    "%s/payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                    domainFrontend,
                    request.getParameter("vnp_ResponseCode"),
                    request.getParameter("orderId"),
                    request.getParameter("vnp_TransactionNo"),
                    request.getParameter("vnp_TxnRef"),
                    request.getParameter("vnp_Amount"),
                    request.getParameter("vnp_BankCode"),
                    request.getParameter("vnp_PayDate")
            );
        }

        if ("00".equals(status)) {
            order.setStatus(isStaffOrder ? PROCESSING : PENDING);
            if (!isStaffOrder && order.getCustomer() != null && order.getCustomer().getCart() != null) {
                clearCart(order.getCustomer().getCart(), cartItemIds);
            }
            sendOrderConfirmationEmail(order);
            notificationWebSocketService.sendOrderNotification(
                order,
                "CREATED",
                String.format("Đơn hàng mới #%d đã được tạo", order.getId())
            );
        } else {
            order.setStatus(PAYMENT_FAILED);
            restoreVariantStock(order);
            if (voucherId != 0) {
                Voucher voucher = voucherRepository.findById(voucherId).orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + voucherId));
                voucherUsageHistoryRepository.deleteByVoucherAndOrder(voucher, order);
            }
        }
        orderRepository.save(order);

        response.sendRedirect(redirectUrl);
    }

    @Override
    public String createPayOsPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, String platform) {
        long amount = order.getFinalTotalPrice().longValue();
        
        String orderCode = String.valueOf(System.currentTimeMillis());
        
        List<PaymentLinkItem> items = order.getOrderDetails().stream()
                .map(detail -> PaymentLinkItem.builder()
                        .name(detail.getProductVariant().getProduct().getName())
                        .quantity(detail.getQuantity().intValue())
                        .price(detail.getPrice().longValue())
                        .build())
                .toList();
        
        long voucherId = voucher != null ? voucher.getId() : 0;
        String cartItemIdsParam = cartItemIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        String returnUrl = payOsReturnUrl + "?orderId=" + order.getId() + "&voucherId=" + voucherId + "&cartItemIds=" + cartItemIdsParam + "&orderCode=" + orderCode + "&platform=" + (platform != null ? platform : "web");
        String cancelUrl = payOsCancelUrl + "?orderId=" + order.getId() + "&voucherId=" + voucherId + "&orderCode=" + orderCode + "&platform=" + (platform != null ? platform : "web");
        
        CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                .orderCode(Long.parseLong(orderCode))
                .amount(amount)
                .description("Thanh toan don hang #" + order.getId())
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .items(items)
                .build();
        
        CreatePaymentLinkResponse result = payOS.paymentRequests().create(paymentRequest);
        
        scheduleRevokeJob(voucher, order.getId(), TIME_OUT + 1);
        
        return result.getCheckoutUrl();
    }

    @Override
    public void handlePayOsSuccess(HttpServletRequest request, HttpServletResponse response) throws Exception {
        Long orderId = Long.parseLong(request.getParameter("orderId"));
        long voucherId = Long.parseLong(request.getParameter("voucherId"));
        List<Long> cartItemIds = Arrays.stream(request.getParameter("cartItemIds").split(","))
                .map(Long::parseLong)
                .toList();
        String orderCode = request.getParameter("orderCode");
        String platform = request.getParameter("platform");
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        try {
            PaymentLink paymentInfo = payOS.paymentRequests().get(Long.parseLong(orderCode));
            if ("PAID".equals(paymentInfo.getStatus().toString())) {
                order.setStatus(PENDING);
                clearCart(order.getCustomer().getCart(), cartItemIds);
                orderRepository.save(order);
                
                sendOrderConfirmationEmail(order);
                notificationWebSocketService.sendOrderNotification(
                    order,
                    "CREATED",
                    String.format("Đơn hàng mới #%d đã được tạo", order.getId())
                );
                
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                String payDate = formatter.format(new Date());

                paymentInfo.getTransactions();
                String redirectUrl;
                if ("mobile".equals(platform)) {
                    redirectUrl = String.format(
                            "ecom-store://payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                            "00",
                            orderId,
                            !paymentInfo.getTransactions().isEmpty()
                                ? paymentInfo.getTransactions().get(0).getReference() : orderCode,
                            orderCode,
                            order.getFinalTotalPrice().longValue(),
                            "PAYOS",
                            payDate
                    );
                } else {
                    redirectUrl = String.format(
                            "%s/payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                            domainFrontend,
                            "00",
                            orderId,
                            !paymentInfo.getTransactions().isEmpty()
                                ? paymentInfo.getTransactions().get(0).getReference() : orderCode,
                            orderCode,
                            order.getFinalTotalPrice().longValue(),
                            "PAYOS",
                            payDate
                    );
                }
                response.sendRedirect(redirectUrl);
            } else {
                handlePaymentFailure(order, voucherId);
                String redirectUrl = buildFailureUrl(orderId, orderCode, order.getFinalTotalPrice().longValue(), "01", platform);
                response.sendRedirect(redirectUrl);
            }
        } catch (Exception e) {
            handlePaymentFailure(order, voucherId);
            String redirectUrl = buildFailureUrl(orderId, orderCode, order.getFinalTotalPrice().longValue(), "99", platform);
            response.sendRedirect(redirectUrl);
        }
    }

    @Override
    public void handlePayOsCancel(HttpServletRequest request, HttpServletResponse response) throws Exception {
        Long orderId = Long.parseLong(request.getParameter("orderId"));
        long voucherId = Long.parseLong(request.getParameter("voucherId"));
        String orderCode = request.getParameter("orderCode");
        String platform = request.getParameter("platform");
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        handlePaymentFailure(order, voucherId);
        
        String redirectUrl = buildFailureUrl(orderId, orderCode, order.getFinalTotalPrice().longValue(), "24", platform);
        response.sendRedirect(redirectUrl);
    }

    private void handlePaymentFailure(Order order, long voucherId) {
        order.setStatus(PAYMENT_FAILED);
        restoreVariantStock(order);
        if (voucherId != 0) {
            Voucher voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + voucherId));
            voucherUsageHistoryRepository.deleteByVoucherAndOrder(voucher, order);
        }
        orderRepository.save(order);
    }

    private String buildFailureUrl(Long orderId, String orderCode, Long amount, String responseCode, String platform) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String payDate = formatter.format(new Date());
        
        if ("mobile".equals(platform)) {
            return String.format(
                    "ecom-store://payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                    responseCode,
                    orderId,
                    orderCode,
                    orderCode,
                    amount,
                    "PAYOS",
                    payDate
            );
        } else {
            return String.format(
                    "%s/payment-status?vnp_ResponseCode=%s&orderId=%s&vnp_TransactionNo=%s&vnp_TxnRef=%s&vnp_Amount=%s&vnp_BankCode=%s&vnp_PayDate=%s",
                    domainFrontend,
                    responseCode,
                    orderId,
                    orderCode,
                    orderCode,
                    amount,
                    "PAYOS",
                    payDate
            );
        }
    }

    private void clearCart(Cart cart, List<Long> cartItemIds) {
        cart.getCartDetails().removeIf(cd -> cartItemIds.contains(cd.getId()));
        cart.setTotalItems((long) cart.getCartDetails().size());
        cartRepository.save(cart);
    }

    private void restoreVariantStock(Order order) {
        order.getOrderDetails().forEach(detail -> {
            var variant = detail.getProductVariant();
            int newStock = variant.getStock() + detail.getQuantity().intValue();
            variant.setStock(newStock);
            productVariantRepository.save(variant);
        });
    }


    private Map<String, String> getVNPayConfig() {
        Map<String, String> vnpParamsMap = new HashMap<>();
        vnpParamsMap.put("vnp_Version", this.vnp_Version);
        vnpParamsMap.put("vnp_Command", this.vnp_Command);
        vnpParamsMap.put("vnp_TmnCode", this.vnp_TmnCode);
        vnpParamsMap.put("vnp_CurrCode", "VND");
        vnpParamsMap.put("vnp_TxnRef",  getRandomNumber(8));
        vnpParamsMap.put("vnp_OrderInfo", "Thanh toan don hang:" +  getRandomNumber(8));
        vnpParamsMap.put("vnp_OrderType", this.orderType);
        vnpParamsMap.put("vnp_Locale", "vn");
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(calendar.getTime());
        vnpParamsMap.put("vnp_CreateDate", vnpCreateDate);
        calendar.add(Calendar.MINUTE, TIME_OUT);
        String vnp_ExpireDate = formatter.format(calendar.getTime());
        vnpParamsMap.put("vnp_ExpireDate", vnp_ExpireDate);
        return vnpParamsMap;
    }

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAddress = "Invalid IP:" + e.getMessage();
        }
        return ipAddress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
    public static String getPaymentURL(Map<String, String> paramsMap, boolean encodeKey) {
        return paramsMap.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey())
                .map(entry ->
                        (encodeKey ? URLEncoder.encode(entry.getKey(),
                                StandardCharsets.US_ASCII)
                                : entry.getKey()) + "=" +
                                URLEncoder.encode(entry.getValue()
                                        , StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));
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
            // Log error but don't fail the payment callback
        }
    }
}
