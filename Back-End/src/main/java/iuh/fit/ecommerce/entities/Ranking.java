package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "rankings")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ranking extends BaseEntity{
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column
    private String description;

    @Column
    private Double minSpending;

    @Column
    private Double maxSpending;

    @Column
    private Double discountRate;

}
