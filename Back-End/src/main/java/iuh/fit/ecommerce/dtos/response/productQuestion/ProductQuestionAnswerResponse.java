package iuh.fit.ecommerce.dtos.response.productQuestion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductQuestionAnswerResponse {
    private Long id;
    private String userName;
    private String content;
    private Boolean status;
    private Boolean admin;
}
