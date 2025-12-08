package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.entities.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring"
)
public interface SupplierMapper {

    Supplier toSupplier(SupplierRequest request);

    SupplierResponse toResponse(Supplier supplier);

    void updateFromRequest(SupplierRequest request, @MappingTarget Supplier supplier);
}