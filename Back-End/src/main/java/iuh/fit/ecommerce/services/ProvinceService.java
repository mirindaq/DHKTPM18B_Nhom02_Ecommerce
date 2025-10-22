package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.province.ProvinceResponse;
import iuh.fit.ecommerce.dtos.response.ward.WardResponse;

import java.util.List;

public interface ProvinceService {
    List<ProvinceResponse> getAllProvinces();
    List<WardResponse> getWardsByProvince(String provinceCode);

    List<WardResponse> getAllWards();
}
