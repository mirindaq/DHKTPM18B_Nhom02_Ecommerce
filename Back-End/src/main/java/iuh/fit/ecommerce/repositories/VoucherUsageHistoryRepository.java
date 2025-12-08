package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.dtos.projection.TopVoucherProjection;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.entities.VoucherUsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    // Top 5 vouchers by day range
    @Query(value = """
            SELECT v.id as voucherId,
                   v.code as voucherCode,
                   v.name as voucherName,
                   COUNT(vuh.id) as usageCount,
                   COALESCE(SUM(vuh.discount_amount), 0) as totalDiscountAmount
            FROM voucher_usage_histories vuh
            JOIN vouchers v ON vuh.voucher_id = v.id
            JOIN orders o ON vuh.order_id = o.id
            WHERE o.order_date BETWEEN :startDate AND :endDate
            GROUP BY v.id, v.code, v.name
            ORDER BY usageCount DESC
            LIMIT 5
            """, nativeQuery = true)
    List<TopVoucherProjection> getTopVouchersByDay(@Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);

    // Top 5 vouchers by month
    @Query(value = """
            SELECT v.id as voucherId,
                   v.code as voucherCode,
                   v.name as voucherName,
                   COUNT(vuh.id) as usageCount,
                   COALESCE(SUM(vuh.discount_amount), 0) as totalDiscountAmount
            FROM voucher_usage_histories vuh
            JOIN vouchers v ON vuh.voucher_id = v.id
            JOIN orders o ON vuh.order_id = o.id
            WHERE YEAR(o.order_date) = :year AND MONTH(o.order_date) = :month
            GROUP BY v.id, v.code, v.name
            ORDER BY usageCount DESC
            LIMIT 5
            """, nativeQuery = true)
    List<TopVoucherProjection> getTopVouchersByMonth(@Param("year") Integer year,
                                                       @Param("month") Integer month);

    // Top 5 vouchers by year
    @Query(value = """
            SELECT v.id as voucherId,
                   v.code as voucherCode,
                   v.name as voucherName,
                   COUNT(vuh.id) as usageCount,
                   COALESCE(SUM(vuh.discount_amount), 0) as totalDiscountAmount
            FROM voucher_usage_histories vuh
            JOIN vouchers v ON vuh.voucher_id = v.id
            JOIN orders o ON vuh.order_id = o.id
            WHERE YEAR(o.order_date) = :year
            GROUP BY v.id, v.code, v.name
            ORDER BY usageCount DESC
            LIMIT 5
            """, nativeQuery = true)
    List<TopVoucherProjection> getTopVouchersByYear(@Param("year") Integer year);

    // Tổng số lần sử dụng voucher theo khoảng thời gian
    @Query(value = """
            SELECT COUNT(vuh.id)
            FROM voucher_usage_histories vuh
            JOIN orders o ON vuh.order_id = o.id
            WHERE o.order_date BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    Long countVoucherUsageByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    // Tổng tiền giảm giá từ voucher theo khoảng thời gian
    @Query(value = """
            SELECT COALESCE(SUM(vuh.discount_amount), 0)
            FROM voucher_usage_histories vuh
            JOIN orders o ON vuh.order_id = o.id
            WHERE o.order_date BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    Double sumVoucherDiscountByDateRange(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    // Lấy tất cả voucher usage với thông tin chi tiết (cho Excel export)
    @Query("SELECT vuh FROM VoucherUsageHistory vuh " +
           "JOIN FETCH vuh.voucher v " +
           "JOIN FETCH vuh.order o " +
           "WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "ORDER BY v.code")
    List<VoucherUsageHistory> findAllWithDetailsByDateRange(@Param("startDate") LocalDateTime startDate,
                                                              @Param("endDate") LocalDateTime endDate);
}
