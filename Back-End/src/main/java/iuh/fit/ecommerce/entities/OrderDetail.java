package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "order_detail")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetail {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private Double discount = 0.0;

    @Column(nullable = false)
    private Double finalPrice;

    @ManyToOne
    @JoinColumn( name = "product_variant_id" )
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn( name = "order_id")
    private Order order;
}
