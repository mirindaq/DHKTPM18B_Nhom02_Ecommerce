package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.entities.Voucher;

public interface EmailService {

    void sendVoucher(String to, Voucher voucher, String code);
}
