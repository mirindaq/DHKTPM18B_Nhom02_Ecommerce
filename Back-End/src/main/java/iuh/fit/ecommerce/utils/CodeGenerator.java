package iuh.fit.ecommerce.utils;

import java.util.UUID;

public class CodeGenerator {
    public static String generateVoucherCode(String prefix) {
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + randomPart;
    }
}