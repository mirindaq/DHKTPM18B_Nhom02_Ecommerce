package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "product_questions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductQuestion extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String content;

    @Column
    @Builder.Default
    private Boolean status = true;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @OneToMany( fetch =  FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<ProductQuestionAnswer> answers = new ArrayList<ProductQuestionAnswer>();

}
