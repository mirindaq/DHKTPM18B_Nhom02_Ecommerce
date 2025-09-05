package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Attribute;

import java.util.List;

public interface AttributeRepository extends JpaRepository<Attribute,Long> {

    List<Attribute> findByStatus(boolean status);

}
