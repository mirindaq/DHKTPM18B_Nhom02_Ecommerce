package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantResponse;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.entities.PromotionTarget;
import iuh.fit.ecommerce.enums.PromotionType;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ProductMapper;
import iuh.fit.ecommerce.mappers.PromotionMapper;
import iuh.fit.ecommerce.repositories.PromotionRepository;
import iuh.fit.ecommerce.repositories.PromotionTargetRepository;
import iuh.fit.ecommerce.services.PromotionService;
import iuh.fit.ecommerce.specifications.PromotionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionTargetRepository promotionTargetRepository;
    private final PromotionMapper promotionMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionAddRequest request) {
        Promotion promotion = promotionMapper.toPromotion(request);

        promotionRepository.save(promotion);

        if (request.getPromotionTargets() != null) {
            List<PromotionTarget> promotionTargets = promotionMapper.toPromotionTargets(request.getPromotionTargets(), promotion);

            promotion.setPromotionTargets(promotionTargets);
            promotionTargetRepository.saveAll(promotionTargets);
        }

        return promotionMapper.toResponse(promotion);
    }


    @Override
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = findById(id);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    public ResponseWithPagination<List<PromotionResponse>> getAllPromotions(int page, int limit, String name,
                                                                            String type, Boolean active,
                                                                            LocalDate startDate, Integer priority) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, limit);

        // Convert type string to PromotionType enum
        PromotionType promotionType = null;
        if (type != null && !type.isEmpty()) {
            try {
                promotionType = PromotionType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid type, will be ignored
            }
        }

        Specification<Promotion> spec = PromotionSpecification.filterPromotions(
                name, promotionType, active, startDate, priority
        );

        Page<Promotion> promotionPage = promotionRepository.findAll(spec, pageable);

        return ResponseWithPagination.fromPage(promotionPage, promotionMapper::toResponse);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionUpdateRequest request) {
        Promotion promotion = findById(id);

//        promotion.setName(request.getName());
//        promotion.setType(request.getType());
//        promotion.setDiscountType(request.getDiscountType());
//        promotion.setDiscountValue(request.getDiscountValue());
//        promotion.setPriority(request.getPriority());
//        promotion.setDescription(request.getDescription());
//        promotion.setStartDate(request.getStartDate());
//        promotion.setEndDate(request.getEndDate());

        promotionRepository.save(promotion);

        // Xoá targets cũ và thêm targets mới
        promotionTargetRepository.deleteByPromotion(promotion);
        if (request.getTargets() != null) {
            promotionTargetRepository.saveAll(promotionMapper.toPromotionTargets(request.getTargets(), promotion));
        }

        return promotionMapper.toResponse(promotion);
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = findById(id);
        promotionTargetRepository.deleteByPromotion(promotion);
        promotionRepository.delete(promotion);
    }

    @Override
    @Transactional
    public void changeStatusPromotion(Long id) {
        Promotion promotion = findById(id);
        promotion.setActive(!promotion.getActive());
        promotionRepository.save(promotion);
    }

    private Promotion findById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id = " + id));
    }

    @Override
    public Double calculateDiscountPrice(ProductVariant variant, Promotion promotion) {
        double original = variant.getPrice();
        double bestDiscount = promotion.getDiscount();
        return original - (original * bestDiscount / 100);
    }

    @Override
    public Double calculateOriginalPrice(ProductVariant variant) {
        return variant.getPrice();
    }

    @Override
    public Promotion getBestPromotion(ProductVariant variant, Map<Long, List<Promotion>> promosByVariant) {
        List<Promotion> promos = promosByVariant.getOrDefault(variant.getId(), List.of());
        return promos.isEmpty() ? null : promos.getFirst();
    }

    @Override
    public Map<Long, List<Promotion>> getPromotionsGroupByVariantId(List<ProductVariant> variants, Product product) {
        List<Long> variantIds = variants.stream().map(ProductVariant::getId).toList();
        List<Long> productIds = List.of(product.getId());
        List<Long> categoryIds = List.of(product.getCategory().getId());
        List<Long> brandIds = List.of(product.getBrand().getId());

        List<Promotion> allPromotions = promotionRepository.findAllValidPromotions(
                variantIds, productIds, categoryIds, brandIds
        );

        // Map variantId -> list promotion, đã ordered
        return variants.stream()
                .collect(Collectors.toMap(
                        ProductVariant::getId,
                        v -> allPromotions.stream()
                                .filter(p -> appliesToVariant(p, v))
                                .toList()
                ));
    }

    @Override
    public Promotion getBestPromotionForVariant(ProductVariant variant) {
        List<Promotion> promos = promotionRepository.findBestPromotionForVariant(
                variant.getId(),
                variant.getProduct().getId(),
                variant.getProduct().getCategory().getId(),
                variant.getProduct().getBrand().getId(),
                PageRequest.of(0, 1)  // chỉ lấy 1 promotion đầu tiên
        );

        return promos.isEmpty() ? null : promos.get(0);
    }

    @Override
    public ProductResponse addPromotionToProductResponseByProduct(Product product) {
        ProductResponse response = productMapper.toResponse(product);

        List<ProductVariant> variants = product.getProductVariants();
        if (variants == null || variants.isEmpty()) return response;

        Map<Long, List<Promotion>>  promosByVariant = getPromotionsGroupByVariantId(variants, product);

        Map<Long, ProductVariant> variantMap = variants.stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        for (ProductVariantResponse v : response.getVariants()) {
            ProductVariant entityVariant = variantMap.get(v.getId());
            if (entityVariant == null) continue;

            Double originalPrice = calculateOriginalPrice(entityVariant);
            v.setOldPrice(originalPrice);

            Promotion bestPromo = getBestPromotion(entityVariant, promosByVariant);

            if (bestPromo != null) {
                Double finalPrice = calculateDiscountPrice(entityVariant, bestPromo);
                v.setPrice(finalPrice);
                v.setDiscount(bestPromo.getDiscount());
            } else {
                v.setPrice(originalPrice);
                v.setDiscount(0.0);
            }
        }
        return response;
    }


    private boolean appliesToVariant(Promotion promo, ProductVariant variant) {
        return promo.getPromotionTargets().stream().anyMatch(pt ->
                (pt.getProductVariant() != null && pt.getProductVariant().getId().equals(variant.getId())) ||
                        (pt.getProduct() != null && pt.getProduct().getId().equals(variant.getProduct().getId())) ||
                        (pt.getCategory() != null && pt.getCategory().getId().equals(variant.getProduct().getCategory().getId())) ||
                        (pt.getBrand() != null && pt.getBrand().getId().equals(variant.getProduct().getBrand().getId()))
        )
                || promo.getPromotionType() == PromotionType.ALL;
    }

}
