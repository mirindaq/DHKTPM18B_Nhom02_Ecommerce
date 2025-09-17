package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "products")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column
    private Integer stock;

    @Column
    private Double discount;

    @Column( columnDefinition = "LONGTEXT")
    private String description;

    @Column
    private String thumbnail;

    @Column
    private Boolean status;

    @Column
    private Double rating;

    @Column
    private String slug;

    @Column
    private String spu;

    @OneToMany( mappedBy = "product", fetch = FetchType.LAZY)
    private List<Feedback> feedbacks;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL ,orphanRemoval = true)
    private List<ProductAttributeValue> attributes = new ArrayList<>();


    @OneToMany(mappedBy = "product",
            fetch = FetchType.LAZY,
            cascade = { CascadeType.MERGE, CascadeType.PERSIST}, orphanRemoval = true)
    private List<ProductImage> productImages = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL ,orphanRemoval = true)
    private List<ProductVariant> productVariants = new ArrayList<>();
}
