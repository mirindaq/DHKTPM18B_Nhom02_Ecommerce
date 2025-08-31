package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}
