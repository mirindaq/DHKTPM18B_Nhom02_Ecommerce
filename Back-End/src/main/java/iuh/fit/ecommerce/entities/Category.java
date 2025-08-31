package vn.com.ecomstore.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "categories")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {

    @Column
    private String name;

    @Column
    private String description;

    @Column
    private String image;

    @Column
    private boolean status;

    @OneToMany( mappedBy = "category" , fetch = FetchType.LAZY,
            cascade = { CascadeType.MERGE, CascadeType.PERSIST})
    private List<Attribute> attributeEntities;
}
