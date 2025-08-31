package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Variant;

public interface VariantRepository extends JpaRepository<Variant, Long> {
}