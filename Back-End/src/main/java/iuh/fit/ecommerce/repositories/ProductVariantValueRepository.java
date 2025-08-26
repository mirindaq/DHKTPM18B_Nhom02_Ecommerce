package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.ProductVariantValue;

public interface ProductVariantValueRepository extends JpaRepository<ProductVariantValue, Long> {
}