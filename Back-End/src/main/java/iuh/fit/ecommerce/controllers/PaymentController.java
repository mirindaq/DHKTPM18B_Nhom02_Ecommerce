package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.services.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${api.prefix}/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping("/vn-pay-callback")
    public void payCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws Exception {
        paymentService.handlePaymentCallBack(request, response);
    }

    @GetMapping("/pay-os-success")
    public void payOsSuccessHandler(HttpServletRequest request, HttpServletResponse response) throws Exception {
        paymentService.handlePayOsSuccess(request, response);
    }

    @GetMapping("/pay-os-cancel")
    public void payOsCancelHandler(HttpServletRequest request, HttpServletResponse response) throws Exception {
        paymentService.handlePayOsCancel(request, response);
    }
}
