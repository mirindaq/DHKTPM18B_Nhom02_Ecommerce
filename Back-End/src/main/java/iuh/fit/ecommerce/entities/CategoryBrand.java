package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "category_brands")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBrand {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne( fetch = FetchType.EAGER )
    @JoinColumn( name = "category_id" )
    private Category category;

    @ManyToOne( fetch = FetchType.EAGER )
    @JoinColumn( name = "brand_id" )
    private Brand brand;
}
