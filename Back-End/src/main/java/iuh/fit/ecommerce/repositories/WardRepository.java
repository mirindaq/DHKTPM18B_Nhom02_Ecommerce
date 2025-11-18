package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WardRepository extends JpaRepository<Ward, Integer> {
    // Integer thay vì String
    List<Ward> findByProvince_Id(Integer provinceId); // Đổi từ Code → Id
}