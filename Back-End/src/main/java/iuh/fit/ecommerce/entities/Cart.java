package iuh.fit.ecommerce.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "carts")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long totalItems;


    @ToString.Exclude
    @JsonIgnore
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @OneToOne
    private User user;


    @OneToMany(mappedBy = "cart",
            cascade = {CascadeType.MERGE, CascadeType.PERSIST},
            orphanRemoval = true)
    private List<CartDetail> cartDetails = new ArrayList<>();

}
