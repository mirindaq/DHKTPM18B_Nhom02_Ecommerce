package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Address;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.customer.id = :customerId")
    void clearDefaultAddress(@Param("customerId") Long customerId);

    // Tránh N+1: load luôn ward + province
    @Query("""
            SELECT a FROM Address a
            JOIN FETCH a.ward w
            JOIN FETCH w.province
            WHERE a.customer.id = :customerId
            ORDER BY a.isDefault DESC, a.id DESC
            """)
    List<Address> findByCustomerIdOrderByDefaultWithDetails(@Param("customerId") Long customerId);

    List<Address> findByCustomerId(Long customerId);

    Optional<Address> findByCustomerIdAndIsDefault(Long customerId, Boolean isDefault);

    long countByCustomerId(Long customerId);
}

