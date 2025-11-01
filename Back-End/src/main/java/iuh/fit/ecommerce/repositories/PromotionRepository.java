package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    @Query("""
            SELECT p FROM Promotion p
            WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:type IS NULL OR p.promotionType = :type)
            AND (:active IS NULL OR p.active = :active)
            AND (:startDate IS NULL OR p.startDate >= :startDate)
            AND (:endDate IS NULL OR p.endDate <= :endDate)
            """)
    Page<Promotion> searchPromotions(@Param("name") String name,
                                     @Param("type") String type,
                                     @Param("active") Boolean active,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate,
                                     Pageable pageable);

    @Query("""
    SELECT DISTINCT p
    FROM Promotion p
    LEFT JOIN p.promotionTargets pt
    WHERE p.active = true
      AND (p.startDate IS NULL OR p.startDate <= CURRENT_DATE)
      AND (p.endDate IS NULL OR p.endDate >= CURRENT_DATE)
      AND (
        pt.productVariant.id IN :variantIds OR
        pt.product.id IN :productIds OR
        pt.category.id IN :categoryIds OR
        pt.brand.id IN :brandIds OR
        p.promotionType = iuh.fit.ecommerce.enums.PromotionType.ALL
      )
""")
    List<Promotion> findAllValidPromotions(
            @Param("variantIds") List<Long> variantIds,
            @Param("productIds") List<Long> productIds,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandIds") List<Long> brandIds
    );



}
