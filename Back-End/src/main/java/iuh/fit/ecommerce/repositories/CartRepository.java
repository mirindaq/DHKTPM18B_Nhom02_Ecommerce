package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import iuh.fit.ecommerce.entities.Cart;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    void deleteByCustomer(Customer customer);

    Optional<Cart> findByCustomer_Id(Long customerId);

    // Lấy tất cả cart có items (cho admin/staff)
    @Query("SELECT DISTINCT c FROM Cart c LEFT JOIN FETCH c.cartDetails cd LEFT JOIN FETCH cd.productVariant pv LEFT JOIN FETCH pv.product WHERE c.totalItems > 0")
    List<Cart> findAllCartsWithItems();

    // Lấy cart có items với phân trang
    @Query(value = "SELECT DISTINCT c FROM Cart c WHERE c.totalItems > 0",
           countQuery = "SELECT COUNT(c) FROM Cart c WHERE c.totalItems > 0")
    Page<Cart> findAllCartsWithItemsPaged(Pageable pageable);

    // Tìm kiếm cart theo tên hoặc email khách hàng
    @Query("SELECT DISTINCT c FROM Cart c WHERE c.totalItems > 0 AND (LOWER(c.customer.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.customer.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Cart> searchCartsByCustomer(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT c FROM Cart c " +
            "LEFT JOIN FETCH c.customer " +
            "LEFT JOIN FETCH c.cartDetails cd " +
            "LEFT JOIN FETCH cd.productVariant pv " +
            "LEFT JOIN FETCH pv.product " +
            "WHERE c.id IN :ids")
    List<Cart> findCartsByIds(@Param("ids") List<Long> ids);
}

