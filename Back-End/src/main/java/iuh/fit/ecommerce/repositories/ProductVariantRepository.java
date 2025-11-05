package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByIdIn(List<Long> ids);
}
