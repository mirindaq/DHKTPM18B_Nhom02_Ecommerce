package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.variantCategory.SetVariantsForCategoryRequest;
import iuh.fit.ecommerce.dtos.response.variantCategory.VariantCategoryResponse;

import java.util.List;

public interface VariantCategoryService {

    void setVariantsForCategory(SetVariantsForCategoryRequest request);

    List<VariantCategoryResponse> getVariantCategoriesByCategoryId(Long categoryId);
}

