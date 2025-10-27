package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "product_question_answers")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductQuestionAnswer extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String content;

    @Column
    @Builder.Default
    private Boolean status = true;

    @Column
    private Boolean admin;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_question_id")
    private ProductQuestion productQuestion;

}
