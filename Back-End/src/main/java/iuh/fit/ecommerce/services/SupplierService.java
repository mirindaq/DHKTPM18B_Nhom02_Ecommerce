package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.entities.Supplier; // Thêm import

import java.time.LocalDate;
import java.util.List;

/**
 * Interface cho Quản lý Nhà cung cấp,
 * được viết dựa trên mẫu CustomerService.
 */
public interface SupplierService {

    /**
     * Tạo nhà cung cấp mới
     * (Giống createCustomer)
     */
    SupplierResponse createSupplier(SupplierRequest request);

    /**
     * Lấy chi tiết nhà cung cấp bằng ID
     * (Giống getCustomerById, nhưng ID là String)
     */
    SupplierResponse getSupplierById(String id);

    /**
     * Lấy danh sách nhà cung cấp (phân trang và tìm kiếm)
     * (Giống getAllCustomers, nhưng thay đổi tham số tìm kiếm)
     */
    ResponseWithPagination<List<SupplierResponse>> getSuppliers(
            int page, int size,
            String name, String phone, String address, Boolean status,
            LocalDate startDate, LocalDate endDate
    );

    /**
     * Cập nhật nhà cung cấp
     * (Giống updateCustomer, nhưng ID là String và dùng chung Request DTO)
     */
    SupplierResponse updateSupplier(String id, SupplierRequest request);

    /**
     * Thay đổi trạng thái (active/inactive)
     * (Giống changeStatusCustomer, nhưng ID là String)
     */
    void changeStatusSupplier(String id);

    /**
     * Lấy Entity (đối tượng) Supplier từ DB
     * (Giống getCustomerEntityById, nhưng ID là String)
     */
    Supplier getSupplierEntityById(String id);

    // Ghi chú: Tôi không thêm hàm "deleteSupplier" (xóa cứng)
    // vì hàm "changeStatusSupplier" an toàn hơn cho nghiệp vụ.
}