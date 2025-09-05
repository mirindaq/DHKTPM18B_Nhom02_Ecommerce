package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
