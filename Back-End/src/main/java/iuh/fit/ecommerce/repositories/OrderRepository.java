package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Order;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("""
        SELECT o FROM Order o
        WHERE o.customer = :customer
            AND (:status IS NULL OR o.status = :status)
            AND (:startDate IS NULL OR o.orderDate >= :startDate)
            AND (:endDate IS NULL OR o.orderDate < :endDate)
            ORDER BY o.orderDate DESC
    """)
    Page<Order> findMyOrders(
            @Param("customer") Customer customer,
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

}