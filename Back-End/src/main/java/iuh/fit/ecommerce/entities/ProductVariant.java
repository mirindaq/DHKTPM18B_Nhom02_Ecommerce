package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "product_variants")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant extends BaseEntity {

    @Column
    private Double price;

    @Column
    private Double oldPrice;

    @Column
    private String sku;

    @Column
    private String stock;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

}