package iuh.fit.ecommerce.validation;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionTargetRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PromotionTargetValidator implements ConstraintValidator<ValidPromotionTarget, PromotionTargetRequest> {

    @Override
    public boolean isValid(PromotionTargetRequest target, ConstraintValidatorContext context) {
        if (target == null) return true; // null sẽ được @NotNull validate nếu cần

        int count = 0;
        if (target.getProductId() != null) count++;
        if (target.getProductVariantId() != null) count++;
        if (target.getCategoryId() != null) count++;
        if (target.getBrandId() != null) count++;

        return count == 1; // chỉ có đúng 1 field được set
    }
}
