package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.feedback.FeedbackResponse;
import iuh.fit.ecommerce.entities.Feedback;
import iuh.fit.ecommerce.entities.FeedbackImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "productImage", source = "productVariant.product.thumbnail")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "imageUrls", expression = "java(mapImageUrls(feedback))")
    @Mapping(target = "createdAt", expression = "java(iuh.fit.ecommerce.utils.DateUtils.formatLocalDateTime(feedback.getCreatedAt()))")
    FeedbackResponse toResponse(Feedback feedback);

    default List<String> mapImageUrls(Feedback feedback) {
        if (feedback.getImages() == null) {
            return List.of();
        }
        return feedback.getImages().stream()
                .map(FeedbackImage::getImgUrl)
                .collect(Collectors.toList());
    }
}
