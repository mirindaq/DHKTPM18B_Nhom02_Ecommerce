package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.dtos.projection.TopProductProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import iuh.fit.ecommerce.entities.OrderDetail;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    
    // Top 5 sản phẩm bán chạy theo ngày
    @Query(value = """
        SELECT p.id as productId,
               p.name as productName,
               p.thumbnail as productImage,
               SUM(od.quantity) as totalQuantitySold,
               SUM(od.final_price) as totalRevenue
        FROM order_detail od
        JOIN product_variants pv ON od.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON od.order_id = o.id
        WHERE o.order_date BETWEEN :startDate AND :endDate
            AND o.status = 'COMPLETED'
        GROUP BY p.id, p.name, p.thumbnail
        ORDER BY totalQuantitySold DESC
        LIMIT 5
    """, nativeQuery = true)
    List<TopProductProjection> getTopProductsByDay(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Top 5 sản phẩm bán chạy theo tháng
    @Query(value = """
        SELECT p.id as productId,
               p.name as productName,
               p.thumbnail as productImage,
               SUM(od.quantity) as totalQuantitySold,
               SUM(od.final_price) as totalRevenue
        FROM order_detail od
        JOIN product_variants pv ON od.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON od.order_id = o.id
        WHERE YEAR(o.order_date) = :year
            AND MONTH(o.order_date) = :month
            AND o.status = 'COMPLETED'
        GROUP BY p.id, p.name, p.thumbnail
        ORDER BY totalQuantitySold DESC
        LIMIT 5
    """, nativeQuery = true)
    List<TopProductProjection> getTopProductsByMonth(
        @Param("year") Integer year,
        @Param("month") Integer month
    );
    
    // Top 5 sản phẩm bán chạy theo năm
    @Query(value = """
        SELECT p.id as productId,
               p.name as productName,
               p.thumbnail as productImage,
               SUM(od.quantity) as totalQuantitySold,
               SUM(od.final_price) as totalRevenue
        FROM order_detail od
        JOIN product_variants pv ON od.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON od.order_id = o.id
        WHERE YEAR(o.order_date) = :year
            AND o.status = 'COMPLETED'
        GROUP BY p.id, p.name, p.thumbnail
        ORDER BY totalQuantitySold DESC
        LIMIT 5
    """, nativeQuery = true)
    List<TopProductProjection> getTopProductsByYear(@Param("year") Integer year);
    
    // TẤT CẢ sản phẩm bán chạy theo ngày (không giới hạn)
    @Query(value = """
        SELECT p.id as productId,
               p.name as productName,
               p.thumbnail as productImage,
               SUM(od.quantity) as totalQuantitySold,
               SUM(od.final_price) as totalRevenue
        FROM order_detail od
        JOIN product_variants pv ON od.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON od.order_id = o.id
        WHERE o.order_date BETWEEN :startDate AND :endDate
            AND o.status = 'COMPLETED'
        GROUP BY p.id, p.name, p.thumbnail
        ORDER BY totalQuantitySold DESC
    """, nativeQuery = true)
    List<TopProductProjection> getAllProductsByDay(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // TẤT CẢ sản phẩm bán chạy theo tháng (không giới hạn)
    @Query(value = """
        SELECT p.id as productId,
               p.name as productName,
               p.thumbnail as productImage,
               SUM(od.quantity) as totalQuantitySold,
               SUM(od.final_price) as totalRevenue
        FROM order_detail od
        JOIN product_variants pv ON od.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON od.order_id = o.id
        WHERE YEAR(o.order_date) = :year
            AND MONTH(o.order_date) = :month
            AND o.status = 'COMPLETED'
        GROUP BY p.id, p.name, p.thumbnail
        ORDER BY totalQuantitySold DESC
    """, nativeQuery = true)
    List<TopProductProjection> getAllProductsByMonth(
        @Param("year") Integer year,
        @Param("month") Integer month
    );
    
    // TẤT CẢ sản phẩm bán chạy theo năm (không giới hạn)
    @Query(value = """
        SELECT p.id as productId,
               p.name as productName,
               p.thumbnail as productImage,
               SUM(od.quantity) as totalQuantitySold,
               SUM(od.final_price) as totalRevenue
        FROM order_detail od
        JOIN product_variants pv ON od.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON od.order_id = o.id
        WHERE YEAR(o.order_date) = :year
            AND o.status = 'COMPLETED'
        GROUP BY p.id, p.name, p.thumbnail
        ORDER BY totalQuantitySold DESC
    """, nativeQuery = true)
    List<TopProductProjection> getAllProductsByYear(@Param("year") Integer year);
    
    // Chi tiết đơn hàng của một sản phẩm cụ thể
    @Query("""
        SELECT od FROM OrderDetail od
        JOIN FETCH od.order o
        JOIN FETCH o.customer
        JOIN FETCH od.productVariant pv
        JOIN FETCH pv.product p
        WHERE p.id = :productId
            AND o.orderDate BETWEEN :startDate AND :endDate
            AND o.status = 'COMPLETED'
        ORDER BY o.orderDate DESC
    """)
    List<OrderDetail> findOrderDetailsByProductAndDateRange(
        @Param("productId") Long productId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}