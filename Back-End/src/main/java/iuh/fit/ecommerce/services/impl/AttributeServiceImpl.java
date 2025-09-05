package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.attribute.AttributeResponse;
import iuh.fit.ecommerce.mappers.AttributeMapper;
import iuh.fit.ecommerce.repositories.AttributeRepository;
import iuh.fit.ecommerce.services.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class AttributeServiceImpl implements AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeMapper attributeMapper;

    @Override
    public  List<AttributeResponse> getAttributesActive(){
        return attributeRepository.findByStatus(true).stream()
                .map(attributeMapper::toResponse)
                .toList();

    }
}
