package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.entities.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE // Bỏ qua nếu các trường không khớp
)
public interface SupplierMapper {

    /**
     * Chuyển từ Request DTO (SupplierRequest) sang Entity (Supplier)
     * Dùng cho nghiệp vụ Tạo mới
     */
    Supplier toSupplier(SupplierRequest request);

    /**
     * Chuyển từ Entity (Supplier) sang Response DTO (SupplierResponse)
     * Dùng để trả về dữ liệu cho client
     */
    SupplierResponse toResponse(Supplier supplier);

    /**
     * Cập nhật Entity (Supplier) từ Request DTO (SupplierRequest)
     * Dùng cho nghiệp vụ Cập nhật
     * @param request DTO chứa thông tin mới
     * @param supplier Entity đã tồn tại trong DB (được đánh dấu @MappingTarget)
     */
    void updateFromRequest(SupplierRequest request, @MappingTarget Supplier supplier);
}