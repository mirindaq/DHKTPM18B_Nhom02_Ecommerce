package iuh.fit.ecommerce.entities;
import jakarta.persistence.*;
import lombok.*;

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
}
