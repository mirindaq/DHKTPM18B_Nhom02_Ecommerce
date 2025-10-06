package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.variant.VariantAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.variant.VariantResponse;

import java.util.List;

public interface VariantService {
    VariantResponse createVariant(VariantAddRequest request);

    ResponseWithPagination<List<VariantResponse>> getVariants(int page, int size, String variantName);

    VariantResponse getVariantById(Long id);

    VariantResponse updateVariant(Long id, VariantAddRequest request);

    void changeStatusVariant(Long id);

    List<VariantResponse> getVariantsByCategory(Long id);
}
