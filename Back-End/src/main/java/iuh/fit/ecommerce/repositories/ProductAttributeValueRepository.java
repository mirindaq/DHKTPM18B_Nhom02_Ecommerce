package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
}