package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promotion_usages")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PromotionUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    private Double discountAmount;
}
