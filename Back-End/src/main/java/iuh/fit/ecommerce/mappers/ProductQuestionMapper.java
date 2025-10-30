package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionResponse;
import iuh.fit.ecommerce.entities.ProductQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {ProductQuestionAnswerMapper.class}
)
public interface ProductQuestionMapper {

    @Mapping(source = "user.fullName", target = "userName")
    ProductQuestionResponse toResponse(ProductQuestion productQuestion);
}
