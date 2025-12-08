package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.configurations.CacheConfig;
import iuh.fit.ecommerce.services.CategoryBrandService;
import iuh.fit.ecommerce.utils.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import iuh.fit.ecommerce.dtos.request.brand.BrandAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.entities.Brand;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.BrandMapper;
import iuh.fit.ecommerce.repositories.BrandRepository;
import iuh.fit.ecommerce.services.BrandService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final CategoryBrandService categoryBrandService;

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.BRAND_CACHE, allEntries = true)
    public BrandResponse createBrand(BrandAddRequest request) {
        validateBrandName(request.getName(), null);

        Brand brand = new Brand();
        mapRequestToBrand(brand, request);
        brandRepository.save(brand);

        return brandMapper.toResponse(brand);
    }

    @Override
    @Cacheable(value = CacheConfig.BRAND_CACHE, key = "'page:' + #page + ':size:' + #size + ':name:' + (#brandName != null ? #brandName : 'all')")
    public ResponseWithPagination<List<BrandResponse>> getBrands(int page, int size, String brandName) {
        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Brand> brandPage ;

        if (brandName != null && !brandName.isBlank()) {
            brandPage = brandRepository.findByNameContainingIgnoreCase(brandName, pageable);
        } else {
            brandPage = brandRepository.findAll(pageable);
        }
        return ResponseWithPagination.fromPage(brandPage, brandMapper::toResponse);
    }

    @Override
    @Cacheable(value = CacheConfig.BRAND_CACHE, key = "#id")
    public BrandResponse getBrandById(Long id) {
        return brandMapper.toResponse(getBrandEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.BRAND_CACHE, key = "#id")
    @CachePut(value = CacheConfig.BRAND_CACHE, key = "#id")
    public BrandResponse updateBrand(Long id, BrandAddRequest request) {
        Brand brand = getBrandEntityById(id);
        validateBrandName(request.getName(), brand);
        mapRequestToBrand(brand, request);
        brandRepository.save(brand);
        return brandMapper.toResponse(brand);
    }

    @Override
    @CacheEvict(value = CacheConfig.BRAND_CACHE, key = "#id")
    public void changeStatusBrand(Long id) {
        Brand brand = getBrandEntityById(id);
        brand.setStatus(!brand.getStatus());
        brandRepository.save(brand);
    }

    @Override
    public Brand getBrandEntityById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
    }

    private void validateBrandName(String name, Brand existingBrand) {
        if (existingBrand == null && brandRepository.existsByName(name)) {
            throw new ConflictException("Brand name already exists");
        }
        if (existingBrand != null && !name.equals(existingBrand.getName()) &&
                brandRepository.existsByName(name)) {
            throw new ConflictException("Brand name already exists");
        }
    }

    private void mapRequestToBrand(Brand brand, BrandAddRequest request) {
        brand.setName(request.getName());
        brand.setDescription(request.getDescription());
        brand.setImage(request.getImage());
        brand.setOrigin(request.getOrigin());
        brand.setStatus(Boolean.TRUE.equals(request.getStatus()));
        brand.setSlug(StringUtils.normalizeString(request.getName()));
    }
}
