package iuh.fit.ecommerce.validation;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionTargetRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PromotionTargetValidator implements ConstraintValidator<ValidPromotionTarget, PromotionTargetRequest> {

    @Override
    public boolean isValid(PromotionTargetRequest targetRequest, ConstraintValidatorContext context) {
        if (targetRequest == null) return true; // null sẽ được @NotNull validate nếu cần

        int nonNullCount = 0;
        if (targetRequest.getProductId() != null && targetRequest.getProductId() > 0) nonNullCount++;
        if (targetRequest.getProductVariantId() != null && targetRequest.getProductVariantId() > 0) nonNullCount++;
        if (targetRequest.getCategoryId() != null && targetRequest.getCategoryId() > 0) nonNullCount++;
        if (targetRequest.getBrandId() != null && targetRequest.getBrandId() > 0) nonNullCount++;

        return nonNullCount == 1;
    }
}
