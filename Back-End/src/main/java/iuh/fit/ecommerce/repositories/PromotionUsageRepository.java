package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.dtos.projection.TopPromotionProjection;
import iuh.fit.ecommerce.entities.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {

    // Top 5 promotions by day range
    @Query(value = """
            SELECT p.id as promotionId,
                   p.name as promotionName,
                   p.promotion_type as promotionType,
                   COUNT(pu.id) as usageCount,
                   COALESCE(SUM(pu.discount_amount), 0) as totalDiscountAmount
            FROM promotion_usages pu
            JOIN promotions p ON pu.promotion_id = p.id
            JOIN orders o ON pu.order_id = o.id
            WHERE o.order_date BETWEEN :startDate AND :endDate
            GROUP BY p.id, p.name, p.promotion_type
            ORDER BY usageCount DESC
            LIMIT 5
            """, nativeQuery = true)
    List<TopPromotionProjection> getTopPromotionsByDay(@Param("startDate") LocalDateTime startDate,
                                                        @Param("endDate") LocalDateTime endDate);

    // Top 5 promotions by month
    @Query(value = """
            SELECT p.id as promotionId,
                   p.name as promotionName,
                   p.promotion_type as promotionType,
                   COUNT(pu.id) as usageCount,
                   COALESCE(SUM(pu.discount_amount), 0) as totalDiscountAmount
            FROM promotion_usages pu
            JOIN promotions p ON pu.promotion_id = p.id
            JOIN orders o ON pu.order_id = o.id
            WHERE YEAR(o.order_date) = :year AND MONTH(o.order_date) = :month
            GROUP BY p.id, p.name, p.promotion_type
            ORDER BY usageCount DESC
            LIMIT 5
            """, nativeQuery = true)
    List<TopPromotionProjection> getTopPromotionsByMonth(@Param("year") Integer year,
                                                          @Param("month") Integer month);

    // Top 5 promotions by year
    @Query(value = """
            SELECT p.id as promotionId,
                   p.name as promotionName,
                   p.promotion_type as promotionType,
                   COUNT(pu.id) as usageCount,
                   COALESCE(SUM(pu.discount_amount), 0) as totalDiscountAmount
            FROM promotion_usages pu
            JOIN promotions p ON pu.promotion_id = p.id
            JOIN orders o ON pu.order_id = o.id
            WHERE YEAR(o.order_date) = :year
            GROUP BY p.id, p.name, p.promotion_type
            ORDER BY usageCount DESC
            LIMIT 5
            """, nativeQuery = true)
    List<TopPromotionProjection> getTopPromotionsByYear(@Param("year") Integer year);

    // Tổng số lần sử dụng promotion theo khoảng thời gian
    @Query(value = """
            SELECT COUNT(pu.id)
            FROM promotion_usages pu
            JOIN orders o ON pu.order_id = o.id
            WHERE o.order_date BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    Long countPromotionUsageByDateRange(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    // Tổng tiền giảm giá từ promotion theo khoảng thời gian
    @Query(value = """
            SELECT COALESCE(SUM(pu.discount_amount), 0)
            FROM promotion_usages pu
            JOIN orders o ON pu.order_id = o.id
            WHERE o.order_date BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    Double sumPromotionDiscountByDateRange(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
}
