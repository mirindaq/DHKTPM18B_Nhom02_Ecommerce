package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.DiscountType;
import iuh.fit.ecommerce.enums.PromotionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "promotions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private PromotionType type;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private Double discountValue;     // 10 (%), hoặc 50000 (VNĐ)
    private Boolean active;
    private Integer priority;
    private String description;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "promotion", fetch = FetchType.LAZY)
    private List<PromotionTarget> promotionTargets;
}
