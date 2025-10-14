package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "feedback_images")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackImage {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String imgUrl;

    @ManyToOne
    @JoinColumn(name = "feedback_id")
    private Feedback feedback;


}
