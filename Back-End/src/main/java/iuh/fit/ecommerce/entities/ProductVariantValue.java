package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "product_variant_values")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantValue extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "variant_value_id")
    private VariantValue variantValue;


}