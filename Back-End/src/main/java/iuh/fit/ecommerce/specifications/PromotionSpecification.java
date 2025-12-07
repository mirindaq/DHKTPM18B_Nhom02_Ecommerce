package iuh.fit.ecommerce.specifications;

import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.enums.PromotionType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PromotionSpecification {

    public static Specification<Promotion> filterPromotions(
            String name,
            PromotionType promotionType,
            Boolean active,
            LocalDate startDate,
            Integer priority
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tìm kiếm theo tên
            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }

            // Lọc theo loại khuyến mãi (đối tượng)
            if (promotionType != null) {
                predicates.add(cb.equal(root.get("promotionType"), promotionType));
            }

            // Lọc theo trạng thái
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            // Lọc theo thời gian bắt đầu
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), startDate));
            }

            // Lọc theo độ ưu tiên
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            assert query != null;
            query.distinct(true);
            query.orderBy(
                    cb.asc(root.get("priority")), // Sắp xếp theo độ ưu tiên tăng dần
                    cb.desc(root.get("createdAt")) // Sau đó theo ngày tạo mới nhất
            );
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

