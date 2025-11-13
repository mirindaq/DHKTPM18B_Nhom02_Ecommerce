package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.province.ProvinceResponse;
import iuh.fit.ecommerce.dtos.response.ward.WardResponse;
import iuh.fit.ecommerce.repositories.ProvinceRepository;
import iuh.fit.ecommerce.repositories.WardRepository;
import iuh.fit.ecommerce.services.ProvinceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProvinceServiceImpl implements ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;

    @Override
    public List<ProvinceResponse> getAllProvinces() {
        return provinceRepository.findAll().stream()
                .map(p -> new ProvinceResponse(p.getCode(), p.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public List<WardResponse> getWardsByProvince(String provinceCode) {
        return wardRepository.findByProvince_Code(provinceCode).stream()
                .map(w -> new WardResponse(w.getCode(), w.getName(), w.getProvince().getCode()))
                .collect(Collectors.toList());
    }
    @Override
    public List<WardResponse> getAllWards() {
        return wardRepository.findAll().stream()
                .map(w -> new WardResponse(w.getCode(), w.getName(), w.getProvince().getCode()))
                .collect(Collectors.toList());
    }


}
