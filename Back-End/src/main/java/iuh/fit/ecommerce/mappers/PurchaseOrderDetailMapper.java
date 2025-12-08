package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.purchaseOrder.PurchaseOrderDetailResponse;
import iuh.fit.ecommerce.entities.PurchaseOrderDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductVariantOrderMapper.class})
public interface PurchaseOrderDetailMapper {
    PurchaseOrderDetailResponse toResponse(PurchaseOrderDetail purchaseOrderDetail);
}
