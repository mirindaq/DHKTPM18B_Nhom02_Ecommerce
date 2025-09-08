package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c WHERE " +
            "(:name IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:phone IS NULL OR c.phone LIKE CONCAT('%', :phone, '%')) AND " +
            "(:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:status IS NULL OR c.active = :status)")
    Page<Customer> searchCustomers(@Param("name") String name,
                                   @Param("phone") String phone,
                                   @Param("email") String email,
                                   @Param("status") Boolean status,
                                   Pageable pageable);
}
