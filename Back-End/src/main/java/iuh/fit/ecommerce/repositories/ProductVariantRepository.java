package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
}