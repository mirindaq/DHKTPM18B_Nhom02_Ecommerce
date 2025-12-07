package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import iuh.fit.ecommerce.entities.Order;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    
    @Query("""
        SELECT o FROM Order o
        WHERE o.customer = :customer
            AND (:statuses IS NULL OR o.status IN :statuses)
            AND (:startDate IS NULL OR o.orderDate >= :startDate)
            AND (:endDate IS NULL OR o.orderDate < :endDate)
        ORDER BY o.orderDate DESC
    """)
    Page<Order> findMyOrders(
            @Param("customer") Customer customer,
            @Param("statuses") List<OrderStatus> statuses,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // Find orders by customerId with pagination
    List<Order> findByCustomerId(Long customerId, Pageable pageable);
    
    //  Tính tổng doanh thu
    @Query("SELECT COALESCE(SUM(o.finalTotalPrice), 0.0) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status = 'COMPLETED'")
    Double sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    //Đếm số đơn hàng
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    

    //Doanh thu theo từng ngày
    @Query(value = """
        SELECT DATE(o.order_date) as orderDate,
               COALESCE(SUM(o.final_total_price), 0) as revenue,
               COUNT(*) as orderCount
        FROM orders o
        WHERE o.order_date BETWEEN :startDate AND :endDate
            AND o.status = 'COMPLETED'
        GROUP BY DATE(o.order_date)
        ORDER BY orderDate ASC
    """, nativeQuery = true)
    List<Object[]> getRevenueByDay(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
