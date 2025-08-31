package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}