package iuh.fit.ecommerce.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Brand;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    boolean existsByName(String name);

    Page<Brand> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    List<Brand> findBySlugIn(List<String> slugs);
}
