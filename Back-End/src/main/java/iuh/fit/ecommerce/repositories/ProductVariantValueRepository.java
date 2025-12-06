package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import iuh.fit.ecommerce.entities.ProductVariantValue;

public interface ProductVariantValueRepository extends JpaRepository<ProductVariantValue, Long> {

    @Modifying
    @Query("DELETE FROM ProductVariantValue pvv WHERE pvv.productVariant.id = :productVariantId")
    void deleteByProductVariantId(@Param("productVariantId") Long productVariantId);
}