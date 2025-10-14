package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Feedback;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.enums.VoucherType;
import org.hibernate.sql.results.graph.FetchList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    @Query("""
        SELECT v FROM Voucher v
        WHERE (:name IS NULL OR v.name LIKE %:name%)
          AND (:type IS NULL OR v.voucherType = :type)
          AND (:active IS NULL OR v.active = :active)
          AND (:startDate IS NULL OR v.startDate >= :startDate)
          AND (:endDate IS NULL OR v.endDate <= :endDate)
        """)
    Page<Voucher> searchVouchers(@Param("name") String name,
                                 @Param("type") VoucherType type,
                                 @Param("active") Boolean active,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate, Pageable pageable);

    List<Voucher> findAllByVoucherTypeAndEndDateGreaterThanEqualAndStartDateLessThanEqual(VoucherType voucherType
            , LocalDate endDateIsGreaterThan
            , LocalDate startDateIsLessThan);

    boolean existsByCode(String code);
}