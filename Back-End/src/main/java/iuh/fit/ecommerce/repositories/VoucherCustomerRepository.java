package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.VoucherCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoucherCustomerRepository extends JpaRepository<VoucherCustomer, Long> {
    List<VoucherCustomer> findAllByVoucher_Id(Long voucherId);
}
