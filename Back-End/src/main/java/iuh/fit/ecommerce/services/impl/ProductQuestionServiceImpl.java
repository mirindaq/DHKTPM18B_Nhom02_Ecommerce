package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionAddRequest;
import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionAnswerAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ProductQuestionMapper;
import iuh.fit.ecommerce.repositories.ProductQuestionRepository;
import iuh.fit.ecommerce.services.ProductQuestionService;
import iuh.fit.ecommerce.services.ProductService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductQuestionServiceImpl implements ProductQuestionService {

    private final ProductQuestionRepository productQuestionRepository;
    private final ProductService productService;
    private final ProductQuestionMapper productQuestionMapper;
    private final SecurityUtils securityUtils;

    @Override
    public ProductQuestionResponse createProductQuestion(ProductQuestionAddRequest request) {
        User user = securityUtils.getCurrentUser();

        Product product = productService.getProductEntityById(request.getProductId());

        ProductQuestion productQuestion = ProductQuestion.builder()
                .product(product)
                .user(user)
                .content(request.getContent())
                .build();

        return productQuestionMapper.toResponse(productQuestionRepository.save(productQuestion));
    }

    @Override
    public ResponseWithPagination<List<ProductQuestionResponse>> getProductQuestionsByProductSlug(String slug, int page, int size) {
        page = Math.max(0, page - 1);
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Product product = productService.getProductEntityBySlug(slug);

        Page<ProductQuestion> productQuestionsPage = productQuestionRepository.findByProduct(product, pageable);

        return ResponseWithPagination.fromPage(productQuestionsPage, productQuestionMapper::toResponse);
    }

    @Override
    public ProductQuestionResponse createProductQuestionAnswer(ProductQuestionAnswerAddRequest request) {
        User user = securityUtils.getCurrentUser();

        ProductQuestion productQuestion = productQuestionRepository.findById(request.getProductQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Product question not found with id: " + request.getProductQuestionId()));


        ProductQuestionAnswer productQuestionAnswer = ProductQuestionAnswer.builder()
                .user(user)
                .productQuestion(productQuestion)
                .admin(user instanceof Staff)
                .content(request.getContent())
                .build();

        productQuestion.getAnswers().add(productQuestionAnswer);

        return productQuestionMapper.toResponse(productQuestionRepository.save(productQuestion));
    }

}
