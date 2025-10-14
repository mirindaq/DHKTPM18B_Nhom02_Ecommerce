package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.VoucherCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherCustomerRepository extends JpaRepository<VoucherCustomer, Long> {
}
