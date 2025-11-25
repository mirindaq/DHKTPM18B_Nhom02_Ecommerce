package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    @Query("""
        SELECT f FROM Feedback f
        WHERE f.order.id = :orderId
            AND f.productVariant.id = :productVariantId
            AND f.customer.id = :customerId
    """)
    Optional<Feedback> findByOrderIdAndProductVariantIdAndCustomerId(
            @Param("orderId") Long orderId,
            @Param("productVariantId") Long productVariantId,
            @Param("customerId") Long customerId
    );

    @Query("""
        SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END
        FROM Feedback f
        WHERE f.order.id = :orderId
            AND f.productVariant.id = :productVariantId
            AND f.customer.id = :customerId
    """)
    boolean existsByOrderIdAndProductVariantIdAndCustomerId(
            @Param("orderId") Long orderId,
            @Param("productVariantId") Long productVariantId,
            @Param("customerId") Long customerId
    );
    
    @Query("""
        SELECT f FROM Feedback f
        LEFT JOIN FETCH f.customer c
        LEFT JOIN FETCH f.productVariant pv
        LEFT JOIN FETCH pv.product p
        WHERE (:rating IS NULL OR f.rating = :rating)
        AND (:status IS NULL OR f.status = :status)
        AND (:fromDate IS NULL OR f.createdAt >= :fromDate)
        AND (:toDate IS NULL OR f.createdAt <= :toDate)
        ORDER BY f.createdAt DESC
    """)
    Page<Feedback> findAllWithFilters(
            @Param("rating") Integer rating,
            @Param("status") Boolean status,
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDate") java.time.LocalDateTime toDate,
            Pageable pageable
    );
}