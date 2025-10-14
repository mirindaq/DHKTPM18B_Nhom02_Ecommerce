package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "customers")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Customer extends User {

    @Column
    private Double totalSpending;

    @ManyToOne
    @JoinColumn(name = "ranking_id")
    private Ranking ranking;

}
