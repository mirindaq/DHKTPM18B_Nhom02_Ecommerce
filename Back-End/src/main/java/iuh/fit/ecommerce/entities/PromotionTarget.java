package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promotion_targets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = true)
    private ProductVariant productVariant; // Giảm cho SKU cụ thể

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = true)
    private Product product; // Hoặc giảm cho toàn bộ SPU

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = true)
    private Category category; // Giảm cho danh mục

    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = true)
    private Brand brand; // Giảm cho brand
}
