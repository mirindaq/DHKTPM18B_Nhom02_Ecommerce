package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.configurations.CacheConfig;
import iuh.fit.ecommerce.dtos.response.province.ProvinceResponse;
import iuh.fit.ecommerce.dtos.response.ward.WardResponse;
import iuh.fit.ecommerce.repositories.ProvinceRepository;
import iuh.fit.ecommerce.repositories.WardRepository;
import iuh.fit.ecommerce.services.ProvinceService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProvinceServiceImpl implements ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;

    @Override
    @Cacheable(value = CacheConfig.PROVINCE_CACHE, key = "'all'")
    public List<ProvinceResponse> getAllProvinces() {
        return provinceRepository.findAll().stream()
                .map(p -> new ProvinceResponse(p.getId(), p.getName()))
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = CacheConfig.PROVINCE_CACHE, key = "'wards:' + #provinceId")
    public List<WardResponse> getWardsByProvince(Integer provinceId) {
        return wardRepository.findByProvince_Id(provinceId).stream()
                .map(w -> new WardResponse(
                        w.getId(),
                        w.getName(),
                        w.getProvince().getId()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = CacheConfig.PROVINCE_CACHE, key = "'wards:all'")
    public List<WardResponse> getAllWards() {
        return wardRepository.findAll().stream()
                .map(w -> new WardResponse(
                        w.getId(),
                        w.getName(),
                        w.getProvince().getId()
                ))
                .collect(Collectors.toList());
    }
}
