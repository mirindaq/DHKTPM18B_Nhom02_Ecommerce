package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Variant;

public interface VariantRepository extends JpaRepository<Variant, Long> {
}