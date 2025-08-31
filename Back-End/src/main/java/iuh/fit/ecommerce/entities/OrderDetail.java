package vn.com.ecomstore.entities;

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

    private Double price;

    private Long quantity;

    @ManyToOne
    @JoinColumn( name = "product_variant_value_id" )
    private ProductVariantValue productVariantValue;

    @ManyToOne
    @JoinColumn( name = "order_id")
    private Order order;
}
