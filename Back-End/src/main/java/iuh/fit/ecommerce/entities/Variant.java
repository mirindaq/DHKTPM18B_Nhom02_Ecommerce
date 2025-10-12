package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "variants")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Variant extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column(nullable = false)
    private Boolean status = true;

    @Column
    private String slug;

    @ManyToOne
    @JoinColumn( name = "category_id", nullable = false)
    private Category category;

    @OneToMany( mappedBy = "variant")
    private List<VariantValue> variantValues;
}
