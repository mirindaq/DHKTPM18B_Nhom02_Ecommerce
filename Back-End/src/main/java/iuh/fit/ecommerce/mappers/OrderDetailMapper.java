package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.order.OrderDetailResponse;
import iuh.fit.ecommerce.entities.OrderDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductVariantMapper.class})
public interface OrderDetailMapper {

    OrderDetailResponse toResponse(OrderDetail orderDetail);
}
