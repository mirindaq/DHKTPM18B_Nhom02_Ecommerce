package iuh.fit.ecommerce.specifications;

import iuh.fit.ecommerce.entities.PurchaseOrder;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PurchaseOrderSpecification {

    public static Specification<PurchaseOrder> hasSupplierId(String supplierId) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("supplier").get("id"), supplierId);
    }

    public static Specification<PurchaseOrder> hasStartDate(LocalDate startDate) {
        return (root, query, criteriaBuilder) -> {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            return criteriaBuilder.greaterThanOrEqualTo(root.get("purchaseDate"), startDateTime);
        };
    }

    public static Specification<PurchaseOrder> hasEndDate(LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
            return criteriaBuilder.lessThanOrEqualTo(root.get("purchaseDate"), endDateTime);
        };
    }
}
