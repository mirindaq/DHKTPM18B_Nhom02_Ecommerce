package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import iuh.fit.ecommerce.entities.ProductAttributeValue;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {

    @Modifying
    @Query("DELETE FROM ProductAttributeValue pav WHERE pav.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}