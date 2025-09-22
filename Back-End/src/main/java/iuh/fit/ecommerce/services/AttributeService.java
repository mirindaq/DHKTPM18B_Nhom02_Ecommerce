package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.attribute.AttributeResponse;
import iuh.fit.ecommerce.entities.Attribute;
import iuh.fit.ecommerce.entities.Category;

import java.util.List;

public interface AttributeService {
    List<AttributeResponse> getAttributesActive();
    Attribute getAttributeEntityById(Long id);
}
