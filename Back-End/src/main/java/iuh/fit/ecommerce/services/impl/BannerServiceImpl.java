package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.banner.BannerAddRequest;
import iuh.fit.ecommerce.dtos.request.banner.BannerUpdateRequest;
import iuh.fit.ecommerce.dtos.response.banner.BannerResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.entities.Banner;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.BannerMapper;
import iuh.fit.ecommerce.repositories.BannerRepository;
import iuh.fit.ecommerce.services.BannerService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final SecurityUtils securityUtils;

    @Override
    public BannerResponse getBannerById(Long id) {
        Banner banner = getBannerEntityById(id);
        return bannerMapper.toResponse(banner);
    }

    @Override
    public BannerResponse addBanner(BannerAddRequest request) {
        Banner banner = bannerMapper.toEntity(request);
        Staff staff = securityUtils.getCurrentStaff();
        banner.setStaff(staff);
        return bannerMapper.toResponse(  bannerRepository.save(banner));
    }

    @Override
    public BannerResponse updateBanner(Long id, BannerUpdateRequest request) {
        Banner banner = getBannerEntityById(id);

        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setDescription(request.getDescription());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setIsActive(request.getIsActive());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());

        bannerRepository.save(banner);

        return bannerMapper.toResponse(banner);
    }

    private Banner getBannerEntityById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
    }


    @Override
    public ResponseWithPagination<List<BannerResponse>> getAllBanners(int page, int size, LocalDate startDate, LocalDate endDate, Boolean isActive) {
        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Banner> bannerPage = bannerRepository.findByFilters(startDate, endDate, isActive, pageable);

        return ResponseWithPagination.fromPage(bannerPage, bannerMapper::toResponse);
    }

    @Override
    public List<BannerResponse> getBannerToDisplay() {
        LocalDate today = LocalDate.now();
        List<Banner> banners = bannerRepository.findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(today, today);
        return banners.stream()
                .map(bannerMapper::toResponse)
                .collect(Collectors.toList());
    }
}
