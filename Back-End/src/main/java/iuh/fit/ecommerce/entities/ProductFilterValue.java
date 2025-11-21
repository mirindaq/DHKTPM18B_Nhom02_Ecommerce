package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "product_filter_values")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filter_value_id", nullable = false)
    private FilterValue filterValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
