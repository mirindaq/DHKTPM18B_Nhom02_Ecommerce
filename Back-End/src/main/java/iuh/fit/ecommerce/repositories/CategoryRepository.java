package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);
}