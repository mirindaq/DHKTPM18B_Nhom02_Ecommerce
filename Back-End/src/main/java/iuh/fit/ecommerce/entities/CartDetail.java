package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "cart_detail")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDetail {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    private Double price;

    private Double discount;

    private Long quantity;

    @ManyToOne
    @JoinColumn( name = "product_variant_id" )
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn( name = "cart_id")
    private Cart cart;

}
