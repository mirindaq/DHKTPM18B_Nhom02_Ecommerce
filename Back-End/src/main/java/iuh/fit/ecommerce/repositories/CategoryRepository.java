package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}