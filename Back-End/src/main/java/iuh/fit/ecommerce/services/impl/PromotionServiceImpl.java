package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.entities.PromotionTarget;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.PromotionMapper;
import iuh.fit.ecommerce.repositories.PromotionRepository;
import iuh.fit.ecommerce.repositories.PromotionTargetRepository;
import iuh.fit.ecommerce.services.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionTargetRepository promotionTargetRepository;
    private final PromotionMapper promotionMapper;

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
                                                                            LocalDate startDate, LocalDate endDate) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, limit);

        Page<Promotion> promotionPage = promotionRepository.searchPromotions(
                name, type, active, startDate, endDate, pageable
        );

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
    public Double calculateDiscountPrice(ProductVariant variant) {
        double original = variant.getPrice();
        Promotion promotion = getBestPromotion(variant);
        double bestDiscount = promotion.getDiscount();
        return original - (original * bestDiscount / 100);
    }

    @Override
    public Double calculateOriginalPrice(ProductVariant variant) {
        return variant.getPrice();
    }

    @Override
    public Promotion getBestPromotion(ProductVariant variant) {
        List<Promotion> promos = promotionRepository.findAllValidPromotions(
                variant.getId(),
                variant.getProduct().getId(),
                variant.getProduct().getCategory().getId(),
                variant.getProduct().getBrand().getId()
        );


        return promos.stream().min(Comparator
                        .comparing(Promotion::getPriority)
                        .thenComparing(Promotion::getDiscount, Comparator.reverseOrder()))
                .orElse(null);
    }

}
