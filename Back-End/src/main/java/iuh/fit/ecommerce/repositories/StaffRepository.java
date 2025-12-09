package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByEmail(String email);

    Page<Staff> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);

    @Query("SELECT DISTINCT s FROM Staff s " +
            "LEFT JOIN s.userRoles ur " +
            "LEFT JOIN ur.role r " +
            "WHERE (:name IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
            "AND (:phone IS NULL OR s.phone LIKE CONCAT('%', :phone, '%')) " +
            "AND (:status IS NULL OR s.active = :status) " +
            "AND (:joinDate IS NULL OR s.joinDate = :joinDate) " +
            "AND (:roleId IS NULL OR r.id = :roleId)")
    Page<Staff> findAllWithFilters(
            @Param("name") String name,
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("status") Boolean status,
            @Param("joinDate") LocalDate joinDate,
            @Param("roleId") Long roleId,
            Pageable pageable
    );
    
    @Query("SELECT s FROM Staff s " +
            "LEFT JOIN FETCH s.userRoles ur " +
            "LEFT JOIN FETCH ur.role " +
            "WHERE s.id IN :ids")
    List<Staff> findAllWithUserRolesByIds(@Param("ids") List<Long> ids);
    
    @Query("SELECT s FROM Staff s " +
            "LEFT JOIN FETCH s.userRoles ur " +
            "LEFT JOIN FETCH ur.role " +
            "WHERE s.id = :id")
    Optional<Staff> findByIdWithUserRoles(@Param("id") Long id);

    @Query("SELECT DISTINCT s FROM Staff s " +
            "JOIN s.userRoles ur " +
            "JOIN ur.role r " +
            "WHERE s.active = true " +
            "AND r.name = 'STAFF'")
    List<Staff> findAllActiveStaffsOnly();

    Optional<Staff> findByEmail(String email);
}
