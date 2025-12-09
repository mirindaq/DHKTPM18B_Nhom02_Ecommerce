package iuh.fit.ecommerce.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import iuh.fit.ecommerce.entities.Product;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsByName(String name);
    Optional<Product> findBySlug(String slug);

    Product getProductBySlug(String slug);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.productVariants pv " +
            "WHERE (:keyword IS NULL OR (" +
            "   LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "   LOWER(p.spu) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "   LOWER(pv.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))" + // <--- DÒNG QUAN TRỌNG VỪA THÊM
            ")) " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:minPrice IS NULL OR EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p AND v.price >= :minPrice)) " +
           "AND (:maxPrice IS NULL OR EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p AND v.price <= :maxPrice))")
    Page<Product> findProductsWithFilters(
            @Param("keyword") String keyword,
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("status") Boolean status,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable
    );

    @Query("SELECT COUNT(p) FROM Product p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    Long countNewProductsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}