package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.deliveryAssignment.DeliveryAssignmentResponse;
import iuh.fit.ecommerce.entities.DeliveryAssignment;
import iuh.fit.ecommerce.entities.DeliveryImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OrderMapper.class})
public interface DeliveryAssignmentMapper {

    @Mapping(target = "order", source = "order")
    @Mapping(target = "shipperId", source = "shipper.id")
    @Mapping(target = "shipperName", source = "shipper.fullName")
    @Mapping(target = "expectedDeliveryDate", expression = "java(iuh.fit.ecommerce.utils.DateUtils.formatDate(deliveryAssignment.getExpectedDeliveryDate()))")
    @Mapping(target = "deliveredAt", expression = "java(iuh.fit.ecommerce.utils.DateUtils.formatLocalDateTime(deliveryAssignment.getDeliveredAt()))")
    @Mapping(target = "deliveryImages", expression = "java(mapDeliveryImages(deliveryAssignment))")
    DeliveryAssignmentResponse toResponse(DeliveryAssignment deliveryAssignment);

    default List<String> mapDeliveryImages(DeliveryAssignment deliveryAssignment) {
        if (deliveryAssignment.getDeliveryImages() == null) {
            return List.of();
        }
        return deliveryAssignment.getDeliveryImages().stream()
                .map(DeliveryImage::getImageUrl)
                .toList();
    }
}