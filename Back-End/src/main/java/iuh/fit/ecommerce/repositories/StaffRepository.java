package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByEmail(String email);

    Page<Staff> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);

    @Query("SELECT s FROM Staff s " +
            "WHERE (:name IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
            "AND (:phone IS NULL OR s.phone LIKE CONCAT('%', :phone, '%')) " +
            "AND (:status IS NULL OR s.active = :status) " +
            "AND (:startDate IS NULL OR s.joinDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.joinDate <= :endDate)")
    Page<Staff> findAllWithFilters(
            @Param("name") String name,
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("status") Boolean status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    Optional<Staff> findByEmail(String email);
}
