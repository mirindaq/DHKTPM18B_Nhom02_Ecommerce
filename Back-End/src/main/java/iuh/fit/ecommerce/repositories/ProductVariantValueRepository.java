package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.ProductVariantValue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantValueRepository extends JpaRepository<ProductVariantValue, Long> {
}