package vn.com.ecomstore.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "wish_lists")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishList {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn( name = "product_id" )
    private Product productWishList;

    @ManyToOne
    @JoinColumn( name = "user_id")
    private User user;

}
