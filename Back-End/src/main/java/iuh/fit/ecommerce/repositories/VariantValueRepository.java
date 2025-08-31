package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.VariantValue;

public interface VariantValueRepository extends JpaRepository<VariantValue, Long> {
}