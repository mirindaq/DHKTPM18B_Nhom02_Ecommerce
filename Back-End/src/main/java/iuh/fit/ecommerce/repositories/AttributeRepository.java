package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Attribute;

public interface AttributeRepository extends JpaRepository<Attribute,Long> {

}
