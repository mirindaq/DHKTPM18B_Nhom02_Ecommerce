package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.ProductVariantValue;

public interface ProductVariantValueRepository extends JpaRepository<ProductVariantValue, Long> {
}