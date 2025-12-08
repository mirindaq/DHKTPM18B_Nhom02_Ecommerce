package iuh.fit.ecommerce.entities;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "variant_categories")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantCategory extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn( name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn( name = "variant_id", nullable = false)
    private Variant variant;


}
