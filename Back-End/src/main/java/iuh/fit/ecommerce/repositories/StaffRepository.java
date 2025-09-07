package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByEmail(String email);

    Page<Staff> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);
}
