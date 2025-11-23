package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Voucher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

public interface PaymentService {
    String createPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, HttpServletRequest request, String platform);
    void handlePaymentCallBack(HttpServletRequest request, HttpServletResponse response) throws Exception;
    String createPayOsPaymentUrl(Voucher voucher, Order order, List<Long> cartItemIds, String platform);
    void handlePayOsSuccess(HttpServletRequest request, HttpServletResponse response) throws Exception;
    void handlePayOsCancel(HttpServletRequest request, HttpServletResponse response) throws Exception;
}
