package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.attribute.AttributeResponse;

import java.util.List;

public interface AttributeService {
    List<AttributeResponse> getAttributesActive();
}
