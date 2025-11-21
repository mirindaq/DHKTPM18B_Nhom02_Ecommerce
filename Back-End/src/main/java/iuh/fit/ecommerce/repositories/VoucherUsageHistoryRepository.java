package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.entities.VoucherUsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageHistoryRepository extends JpaRepository<VoucherUsageHistory, Long> {
    boolean existsByVoucherAndOrder_Customer(Voucher voucher, Customer customer);
    @Modifying
    void deleteByVoucherAndOrder(Voucher voucher, Order order);

    @Modifying
    void deleteByOrder(Order order);
    List<VoucherUsageHistory> findAllByOrder_Customer(Customer customer);

    boolean existsByOrder(Order order);
}
