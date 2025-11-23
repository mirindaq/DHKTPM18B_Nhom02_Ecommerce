package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.shipper.ShipperResponse;

import java.util.List;

public interface ShipperService {
    List<ShipperResponse> getAllActiveShippers();
    List<ShipperResponse> getAllShippers();
}
