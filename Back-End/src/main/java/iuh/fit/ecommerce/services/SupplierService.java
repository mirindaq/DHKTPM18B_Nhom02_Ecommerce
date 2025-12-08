package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.entities.Supplier; // Thêm import

import java.time.LocalDate;
import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse getSupplierById(Long id);

    ResponseWithPagination<List<SupplierResponse>> getSuppliers(
            int page, int size,
            String name, String phone, String address, Boolean status,
            LocalDate startDate, LocalDate endDate
    );

    SupplierResponse updateSupplier(Long id, SupplierRequest request);

    void changeStatusSupplier(Long id);

    Supplier getSupplierEntityById(Long id);

}