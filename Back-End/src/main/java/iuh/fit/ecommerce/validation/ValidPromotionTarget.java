package iuh.fit.ecommerce.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PromotionTargetValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPromotionTarget {
    String message() default "Exactly one of productId, productVariantId, or categoryId must be set";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
