package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
