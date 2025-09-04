package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.brand.BrandAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;

import java.util.List;

public interface BrandService {

    BrandResponse createBrand(BrandAddRequest request);

    ResponseWithPagination<List<BrandResponse>> getBrands(int page, int size);

    BrandResponse getBrandById(Long id);

    BrandResponse updateBrand(Long id, BrandAddRequest request);

    void changeStatusBrand(Long id);
}
