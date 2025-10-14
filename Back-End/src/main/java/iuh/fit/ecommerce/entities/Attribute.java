package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "attributes")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attribute extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column
    private String slug;

    @ManyToOne
    private Category category;

    @Column(nullable = false)
    private Boolean status = true;
}
