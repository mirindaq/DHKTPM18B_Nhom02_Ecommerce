package iuh.fit.ecommerce.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Variant;

public interface VariantRepository extends JpaRepository<Variant, Long> {
    boolean existsByName(String name);

    Page<Variant> findByNameContainingIgnoreCase(String name, Pageable pageable);
}