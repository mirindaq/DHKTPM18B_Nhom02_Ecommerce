package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "variant_value")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantValue extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String value;

    @Column(nullable = false)
    private Boolean status = true;

    @Column
    private String slug;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private Variant variant;


}
