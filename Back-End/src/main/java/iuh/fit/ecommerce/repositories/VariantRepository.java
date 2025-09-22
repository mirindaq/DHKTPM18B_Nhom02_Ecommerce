package iuh.fit.ecommerce.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Variant;

import java.util.List;

public interface VariantRepository extends JpaRepository<Variant, Long> {
    boolean existsByName(String name);

    Page<Variant> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Variant> findByStatus(Boolean status);

    List<Variant> findByStatusAndCategory_Id(Boolean status, Long categoryId);
}