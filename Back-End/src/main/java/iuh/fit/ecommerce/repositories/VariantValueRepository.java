package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.VariantValue;

public interface VariantValueRepository extends JpaRepository<VariantValue, Long> {
}