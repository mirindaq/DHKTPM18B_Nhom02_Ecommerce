package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "banners")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String title;

    @Column
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String linkUrl;

    @Column
    private Boolean isActive;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;
}
