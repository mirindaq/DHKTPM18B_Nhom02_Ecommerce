package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "filter_values")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filter_criteria_id", nullable = false)
    private FilterCriteria filterCriteria;

    @Column(nullable = false)
    private String value;
}
