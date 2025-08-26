package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "products")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {


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
    private boolean active;

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

    @OneToMany(mappedBy = "product")
    private List<ProductAttributeValue> attributes;


    @OneToMany(mappedBy = "product",
            fetch = FetchType.LAZY,
            cascade = { CascadeType.MERGE, CascadeType.PERSIST})
    private List<ProductImage> productImages;
}
