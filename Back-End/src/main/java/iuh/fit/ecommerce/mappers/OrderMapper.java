package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.entities.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, OrderDetailMapper.class})
public interface OrderMapper {

//    @Mapping(target = "orderDate", expression = "java(iuh.fit.ecommerce.utils.DateUtils.formatLocalDateTime(order.getOrderDate()))")
    OrderResponse toResponse(Order order);
}

