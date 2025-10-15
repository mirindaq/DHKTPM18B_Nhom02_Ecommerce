 package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.utils.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import iuh.fit.ecommerce.dtos.request.variant.VariantValueAddRequest;
import iuh.fit.ecommerce.dtos.response.variant.VariantValueResponse;
import iuh.fit.ecommerce.entities.Variant;
import iuh.fit.ecommerce.entities.VariantValue;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.VariantValueMapper;
import iuh.fit.ecommerce.repositories.VariantRepository;
import iuh.fit.ecommerce.repositories.VariantValueRepository;
import iuh.fit.ecommerce.services.VariantValueService;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

 @Service
@RequiredArgsConstructor
public class VariantValueServiceImpl implements VariantValueService {

    private final VariantValueRepository variantValueRepository;
    private final VariantRepository variantRepository;
    private final VariantValueMapper variantValueMapper;

     private void validateDuplicateValues(List<VariantValueAddRequest> requests, Variant variant) {
         Set<String> uniqueValues = new HashSet<>();
         for (VariantValueAddRequest req : requests) {
             if (!uniqueValues.add(req.getValue())) {
                 throw new ConflictException("Duplicate value '" + req.getValue() + "' found in request");
             }
             if (variantValueRepository.existsByValueAndVariantId(req.getValue(), variant.getId())) {
                 throw new ConflictException(
                         String.format("Variant value '%s' already exists for variant id %d", req.getValue(), variant.getId())
                 );
             }
         }
     }

     @Override
     public List<VariantValue> createValues(List<VariantValueAddRequest> requests, Variant variant) {
         validateDuplicateValues(requests, variant);

         List<VariantValue> values = requests.stream()
                 .map(req -> {
                     VariantValue value = new VariantValue();
                     value.setValue(req.getValue());
                     value.setVariant(variant);
                     value.setSlug(StringUtils.normalizeString(req.getValue()));
                     return value;
                 })
                 .collect(Collectors.toList());

         return variantValueRepository.saveAll(values);
     }

     @Override
     public List<VariantValue> updateValue(List<VariantValueAddRequest> variantValues, Variant variant) {
         // Danh sách value từ request
         Set<String> newValues = variantValues.stream()
                 .map(VariantValueAddRequest::getValue)
                 .collect(Collectors.toSet());

         // Lấy tất cả value hiện tại từ DB (bao gồm cả active=false)
         List<VariantValue> existingValues = variantValueRepository.findByVariantId((variant.getId()));

         // 1. Disable những value không còn trong request
         existingValues.stream()
                 .filter(ev -> !newValues.contains(ev.getValue()) && ev.getStatus())
                 .forEach(ev -> ev.setStatus(false));

         // 2. Enable lại những value đang inactive nhưng có trong request
         existingValues.stream()
                 .filter(ev -> newValues.contains(ev.getValue()) && !ev.getStatus())
                 .forEach(ev -> ev.setStatus(true));

         // 3. Thêm value mới (chưa có trong DB)
         Set<String> existingValueStrings = existingValues.stream()
                 .map(VariantValue::getValue)
                 .collect(Collectors.toSet());

         List<VariantValue> valuesToAdd = newValues.stream()
                 .filter(val -> !existingValueStrings.contains(val))
                 .map(val -> {
                     VariantValue value = new VariantValue();
                     value.setValue(val);
                     value.setVariant(variant);
                     value.setStatus(true);
                     return value;
                 })
                 .collect(Collectors.toList());

         if (!valuesToAdd.isEmpty()) {
             existingValues.addAll(variantValueRepository.saveAll(valuesToAdd));
         }

         variantValueRepository.saveAll(existingValues);

         return new ArrayList<>(existingValues);
     }


     @Override
    public List<VariantValueResponse> getVariantValueByVariantId(Long id) {
        return variantValueRepository.findByVariant_Id(id).stream()
                .map(variantValueMapper::toResponse)
                .toList();
    }

//    @Override
//    @Transactional
//    public VariantValueResponse updateVariantValue(Long id, VariantValueAddRequest request) {
//        VariantValue value = getVariantValueEntityById(id);
//        Variant variant = getVariantEntityById(request.getVariantId());
//
//        if (!value.getValue().equals(request.getValue()) &&
//                variantValueRepository.existsByValueAndVariantId(request.getValue(), request.getVariantId())) {
//            throw new ConflictException("Variant value already exists for this variant");
//        }
//
//        value.setValue(request.getValue());
//        value.setVariant(variant);
//        value.setStatus(Boolean.TRUE.equals(request.getStatus()));
//        variantValueRepository.save(value);
//
//        return variantValueMapper.toResponse(value);
//    }

    @Override
    public void changeStatusVariantValue(Long id) {
        VariantValue value = getVariantValueEntityById(id);
        value.setStatus(!value.getStatus());
        variantValueRepository.save(value);
    }

    public VariantValue getVariantValueEntityById(Long id) {
        return variantValueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VariantValue not found with id: " + id));
    }

     private Variant getVariantEntityById(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + id));
    }
}
