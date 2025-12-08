package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.purchaseOrder.PurchaseOrderResponse;
import iuh.fit.ecommerce.entities.PurchaseOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {SupplierMapper.class, StaffMapper.class, PurchaseOrderDetailMapper.class})
public interface PurchaseOrderMapper {
    
    @Mapping(target = "purchaseDate", expression = "java(iuh.fit.ecommerce.utils.DateUtils.formatLocalDateTime(purchaseOrder.getPurchaseDate()))")
    @Mapping(target = "details", ignore = true)
    PurchaseOrderResponse toResponse(PurchaseOrder purchaseOrder);
}
