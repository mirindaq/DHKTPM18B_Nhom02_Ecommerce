package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.entities.Supplier;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    SupplierResponse toResponse(Supplier supplier);
}
