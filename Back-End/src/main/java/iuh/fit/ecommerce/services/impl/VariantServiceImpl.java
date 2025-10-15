// impl
package iuh.fit.ecommerce.services.impl;


import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.services.CategoryService;
import iuh.fit.ecommerce.utils.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import iuh.fit.ecommerce.dtos.request.variant.VariantAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.variant.VariantResponse;
import iuh.fit.ecommerce.entities.Variant;
import iuh.fit.ecommerce.entities.VariantValue;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.VariantMapper;
import iuh.fit.ecommerce.repositories.VariantRepository;
import iuh.fit.ecommerce.services.VariantService;
import iuh.fit.ecommerce.services.VariantValueService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VariantServiceImpl implements VariantService {

    private final VariantRepository variantRepository;
    private final VariantMapper variantMapper;
    private final VariantValueService variantValueService; // tách logic variant value sang service riêng
    private final CategoryService categoryService;

    @Override
    public ResponseWithPagination<List<VariantResponse>> getVariants(int page, int size, String variantName) {
        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Variant> variantPage;

        if (variantName != null && !variantName.isBlank()) {
            variantPage = variantRepository.findByNameContainingIgnoreCase(variantName, pageable);
        } else {
            variantPage = variantRepository.findAll(pageable);
        }
        return ResponseWithPagination.fromPage(variantPage,variantMapper::toResponse);
    }

    @Override
    public VariantResponse getVariantById(Long id) {
        Variant variant = findVariantOrThrow(id);
        return variantMapper.toResponse(variant);
    }

    @Override
    public VariantResponse createVariant(VariantAddRequest request) {
        Variant variant = new Variant();
        mapVariantFields(variant, request);
        variant = variantRepository.save(variant);

        if (request.getVariantValues() != null && !request.getVariantValues().isEmpty()) {
            List<VariantValue> values = variantValueService.createValues(request.getVariantValues(), variant);
            variant.setVariantValues(values);
        }

        return variantMapper.toResponse(variant);
    }

    @Override
    public VariantResponse updateVariant(Long id, VariantAddRequest request) {
        Variant variant = findVariantOrThrow(id);

        mapVariantFields(variant, request);
        variant = variantRepository.save(variant);

        if (request.getVariantValues() != null && !request.getVariantValues().isEmpty()) {
            List<VariantValue> newValues = variantValueService.updateValue(request.getVariantValues(), variant);
            variant.getVariantValues().addAll(newValues);
        }

        return variantMapper.toResponse(variant);
    }

    @Override
    public void changeStatusVariant(Long id) {
        Variant variant = findVariantOrThrow(id);
        variant.setStatus(!variant.getStatus());
        variantRepository.save(variant);
    }

    @Override
    public List<VariantResponse> getVariantsByCategory( Long id) {
        List<Variant> variants = variantRepository.findByStatusAndCategory_Id(true,id);
        return variants.stream()
                .map(variantMapper::toResponse)
                .toList();
    }

    private Variant findVariantOrThrow(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + id));
    }


    private void mapVariantFields(Variant variant, VariantAddRequest request) {
        variant.setName(request.getName());
        variant.setSlug(StringUtils.normalizeString(request.getName()));
        if (request.getStatus() != null) {
            variant.setStatus(request.getStatus());
        }
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());
        variant.setCategory(category);
    }
}