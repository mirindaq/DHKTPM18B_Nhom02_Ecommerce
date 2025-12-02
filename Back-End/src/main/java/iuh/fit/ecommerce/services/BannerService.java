package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.banner.BannerResponse;
import iuh.fit.ecommerce.dtos.request.banner.BannerAddRequest;
import iuh.fit.ecommerce.dtos.request.banner.BannerUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;

import java.time.LocalDate;
import java.util.List;

public interface BannerService {
    BannerResponse getBannerById(Long id);

    BannerResponse addBanner(BannerAddRequest request);

    BannerResponse updateBanner(Long id, BannerUpdateRequest request);

    ResponseWithPagination<List<BannerResponse>> getAllBanners(int page, int size, LocalDate startDate, LocalDate endDate, Boolean isActive);

    List<BannerResponse> getBannerToDisplay();
}
