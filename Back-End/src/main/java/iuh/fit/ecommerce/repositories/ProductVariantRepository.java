package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
}
