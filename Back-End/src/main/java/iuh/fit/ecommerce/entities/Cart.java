package iuh.fit.ecommerce.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "carts")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart extends BaseEntity {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long totalItems;


    @ToString.Exclude
    @JsonIgnore
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @OneToOne
    private Customer customer;


    @OneToMany(mappedBy = "cart",
            cascade = {CascadeType.MERGE, CascadeType.PERSIST},
            orphanRemoval = true)
    private List<CartDetail> cartDetails = new ArrayList<>();

    @Column(name = "last_reminder_sent_at")
    private LocalDateTime lastReminderSentAt;

}
