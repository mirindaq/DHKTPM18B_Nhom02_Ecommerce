package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.repositories.*;
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
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final OrderRepository orderRepository;
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final VoucherRepository voucherRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final int TIME_OUT = 15;

    @Override
    public String createPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, HttpServletRequest request) {
        long amount = order.getFinalTotalPrice().longValue() * 100L;
        Map<String, String> vnpParamsMap = getVNPayConfig();

        long voucherId = voucher != null ? voucher.getId() : 0;
        String cartItemIdsParam = cartItemIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        vnpParamsMap.put("vnp_ReturnUrl", this.vnp_ReturnUrl  + "?orderId=" + order.getId() + "&voucherId=" + voucherId + "&cartItemIds=" + cartItemIdsParam);
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
        List<Long> cartItemIds = Arrays.stream(request.getParameter("cartItemIds").split(","))
                .map(Long::parseLong)
                .toList();

        String redirectUrl = String.format(
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

        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("00".equals(status)) {
            order.setStatus(PENDING);
            clearCart(order.getCustomer().getCart(), cartItemIds);
        }
        else{
            order.setStatus(PAYMENT_FAILED);
            restoreVariantStock(order);
            if(voucherId != 0) {
                Voucher voucher = voucherRepository.findById(voucherId).orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + voucherId));
                voucherUsageHistoryRepository.deleteByVoucherAndOrder(voucher, order);
            }
        }
        orderRepository.save(order);

        response.sendRedirect(redirectUrl);
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
}
