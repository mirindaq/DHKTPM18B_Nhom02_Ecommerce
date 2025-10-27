package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionAnswerResponse;
import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionResponse;
import iuh.fit.ecommerce.entities.ProductQuestion;
import iuh.fit.ecommerce.entities.ProductQuestionAnswer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductQuestionAnswerMapper {

    @Mapping(source = "user.fullName", target = "userName")
    ProductQuestionAnswerResponse toResponse(ProductQuestionAnswer productQuestionAnswer);

}
