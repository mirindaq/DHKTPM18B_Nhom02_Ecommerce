package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.variant.VariantValueAddRequest;
import iuh.fit.ecommerce.dtos.response.variant.VariantValueResponse;
import iuh.fit.ecommerce.entities.Variant;
import iuh.fit.ecommerce.entities.VariantValue;

import java.util.List;

public interface VariantValueService {
    List<VariantValueResponse> getVariantValueByVariantId(Long id);

    void changeStatusVariantValue(Long id);

    List<VariantValue> createValues(List<VariantValueAddRequest> variantValues, Variant variant);

    List<VariantValue> updateValue(List<VariantValueAddRequest> variantValues, Variant variant);
    VariantValue getVariantValueEntityById(Long id);
}
