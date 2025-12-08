package iuh.fit.ecommerce.entities;

import jakarta.persistence.*; // Thêm import
import lombok.*; // Thêm import
import lombok.experimental.SuperBuilder; // Thêm import

@Entity
@Getter
@Setter
@Table(name = "supplier")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Supplier extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column
    private String address;

    @Column
    private Boolean status;

}