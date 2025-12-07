package iuh.fit.ecommerce.specifications;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.enums.OrderStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> filterOrders(
            String customerName,
            LocalDate orderDate,
            String customerPhone,
            OrderStatus status,
            Boolean isPickup
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tìm kiếm theo tên người nhận
            if (customerName != null && !customerName.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("receiverName")), "%" + customerName.toLowerCase() + "%"));
            }

            // Tìm kiếm theo ngày đặt
            if (orderDate != null) {
                LocalDateTime startOfDay = orderDate.atStartOfDay();
                LocalDateTime endOfDay = orderDate.plusDays(1).atStartOfDay();
                predicates.add(cb.between(root.get("orderDate"), startOfDay, endOfDay));
            }

            // Tìm kiếm theo số điện thoại
            if (customerPhone != null && !customerPhone.isEmpty()) {
                predicates.add(cb.like(root.get("receiverPhone"), "%" + customerPhone + "%"));
            }

            // Lọc theo trạng thái đơn hàng
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Lọc theo loại nhận hàng (tại quầy hay giao hàng)
            if (isPickup != null) {
                predicates.add(cb.equal(root.get("isPickup"), isPickup));
            }

            assert query != null;
            query.distinct(true);
            query.orderBy(cb.desc(root.get("orderDate"))); // Sắp xếp theo ngày đặt hàng mới nhất
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

