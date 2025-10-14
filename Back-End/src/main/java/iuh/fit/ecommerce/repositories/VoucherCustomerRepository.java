package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.VoucherCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VoucherCustomerRepository extends JpaRepository<VoucherCustomer, Long> {
    List<VoucherCustomer> findAllByVoucher_Id(Long voucherId);


    @Query("""
    SELECT vc 
    FROM VoucherCustomer vc
    WHERE vc.customer.id = :id
      AND vc.voucher.startDate <= :end
      AND vc.voucher.endDate >= :start
      AND vc.voucher.active = true 
""")
    List<VoucherCustomer> findAllByCustomerIdAndVoucherDateBetweenAndReady(
            @Param("id") Long id,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

}
