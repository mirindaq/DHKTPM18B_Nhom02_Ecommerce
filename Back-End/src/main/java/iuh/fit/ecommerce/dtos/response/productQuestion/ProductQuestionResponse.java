package iuh.fit.ecommerce.dtos.response.productQuestion;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductQuestionResponse  {
    private Long id;
    private String content;
    private Boolean status;
    private String userName;
    private List<ProductQuestionAnswerResponse> answers;
}
