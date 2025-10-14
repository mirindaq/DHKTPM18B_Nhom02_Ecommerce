package iuh.fit.ecommerce.services.impl;


import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@RequiredArgsConstructor
@Service
public class EmailServiceImpl implements EmailService {
    public static final String UTF_8_ENCODING = "UTF-8";
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async("taskExecutor")
    public void sendVoucher(String to, Voucher voucher, String code) {
        try {
            Context context = new Context();
            context.setVariable("voucher", voucher);
            context.setVariable("code", code);
            String text = templateEngine.process("voucher-template", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, UTF_8_ENCODING);

            helper.setPriority(1);
            helper.setSubject("Mã ưu đãi dành riêng cho bạn!");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setText(text, true);

            mailSender.send(message);
        } catch (MessagingException exception) {

            if (exception.getMessage().contains("Recipient address rejected")) {
                throw new RuntimeException("Địa chỉ email không tồn tại");
            } else {
                throw new RuntimeException("Không thể gửi email OTP: " + exception.getMessage());
            }
        } catch (Exception exception) {
            throw new RuntimeException("Có lỗi xảy ra khi gửi email OTP: " + exception.getMessage());
        }
    }
}
