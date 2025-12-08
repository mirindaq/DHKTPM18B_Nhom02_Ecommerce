package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, String> { // <-- ID là String

    /**
     * Tìm kiếm nhà cung cấp tương tự như CustomerRepository
     * Lọc theo name, phone, address, status, và khoảng ngày tạo
     */
    @Query("SELECT s FROM Supplier s WHERE " +
            "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:phone IS NULL OR s.phone LIKE CONCAT('%', :phone, '%')) AND " + // <-- SỬA: Đã xóa 1 dấu ')' thừa ở cuối dòng này
            "(:address IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :address, '%'))) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:startDate IS NULL OR s.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR s.createdAt <= :endDate)")
    Page<Supplier> searchSuppliers(@Param("name") String name,
                                   @Param("phone") String phone,
                                   @Param("address") String address,
                                   @Param("status") Boolean status,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   Pageable pageable);

    // Dùng để kiểm tra (validate) khi tạo mới
    boolean existsByPhone(String phone);

    // Dùng để kiểm tra (validate) khi cập nhật
    boolean existsByPhoneAndIdNot(String phone, String id);

    Optional<Supplier> findByPhone(String phone);
}