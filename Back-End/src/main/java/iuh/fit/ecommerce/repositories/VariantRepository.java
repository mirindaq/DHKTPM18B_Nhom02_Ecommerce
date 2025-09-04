package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Variant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VariantRepository extends JpaRepository<Variant, Long> {
}