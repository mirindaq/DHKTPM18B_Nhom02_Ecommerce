package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "product_attribute_values")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValue extends BaseEntity {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String value;

    @Column
    private String slug;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column
    private Boolean status;

    @ManyToOne
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;

}
