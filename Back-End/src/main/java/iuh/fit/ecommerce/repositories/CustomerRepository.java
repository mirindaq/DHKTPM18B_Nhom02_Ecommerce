package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

//    @Query("SELECT c FROM Customer c WHERE " +
//            "(:name IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
//            "(:phone IS NULL OR c.phone LIKE CONCAT('%', :phone, '%')) AND " +
//            "(:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
//            "(:status IS NULL OR c.active = :status) AND "+
//            "(:startDate IS NULL OR c.createdAt >= :startDate) AND " +
//            "(:endDate IS NULL OR c.registerDate <= :endDate)")
//        @Query("SELECT c FROM Customer c WHERE " +
//            "(:name IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
//            "(:phone IS NULL OR c.phone LIKE CONCAT('%', :phone, '%')) AND " +
//            "(:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
//            "(:status IS NULL OR c.active = :status)")
//    Page<Customer> searchCustomers(@Param("name") String name,
//                                   @Param("phone") String phone,
//                                   @Param("email") String email,
//                                   @Param("status") Boolean status,
//                                   @Param("startDate") LocalDate startDate,
//                                   @Param("endDate") LocalDate endDate,
//                                   Pageable pageable);

    Optional<Customer> findByEmail(String email);


    @Query("SELECT DISTINCT c FROM Customer c " +
            "LEFT JOIN FETCH c.addresses a " +       // Tải Address
            "LEFT JOIN FETCH a.ward w " +            // Tải Ward
            "LEFT JOIN FETCH w.province p " +        // Tải Province
            "WHERE " +
            "(:name IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:phone IS NULL OR c.phone LIKE CONCAT('%', :phone, '%')) AND " +
            "(:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:status IS NULL OR c.active = :status)")
//            "(:startDate IS NULL OR c.createdAt >= :startDate) AND " + // Thêm lọc ngày
//            "(:endDate IS NULL OR c.createdAt <= :endDate)")           // Thêm lọc ngày
    Page<Customer> searchCustomers(@Param("name") String name,
                                   @Param("phone") String phone,
                                   @Param("email") String email,
                                   @Param("status") Boolean status,
                                   @Param("startDate") LocalDate startDate, // Bổ sung tham số ngày
                                   @Param("endDate") LocalDate endDate,     // Bổ sung tham số ngày
                                   Pageable pageable);
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
