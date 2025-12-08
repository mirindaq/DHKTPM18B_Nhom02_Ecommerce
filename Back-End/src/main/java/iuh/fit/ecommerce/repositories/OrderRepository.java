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

    @Query("SELECT SUM(o.finalTotalPrice) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :startDate AND :endDate")
    Double sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :startDate AND :endDate")
    Long countCompletedOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
