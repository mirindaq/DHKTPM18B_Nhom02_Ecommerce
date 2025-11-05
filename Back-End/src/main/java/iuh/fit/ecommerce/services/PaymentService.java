package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Voucher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

public interface PaymentService {
    String createPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, HttpServletRequest request);
    void handlePaymentCallBack(HttpServletRequest request, HttpServletResponse response) throws Exception;
}
