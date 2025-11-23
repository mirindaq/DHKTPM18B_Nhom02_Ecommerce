package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.ecommerce.dtos.request.ai.ChatAIRequest;
import iuh.fit.ecommerce.dtos.response.ai.ChatAIResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.services.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/ai")
@RequiredArgsConstructor
@Tag(name = "AI Controller", description = "AI Chat Assistant for customer support")
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ResponseSuccess<ChatAIResponse>> chat(
            @Valid @RequestBody ChatAIRequest request
    ) {
        ChatAIResponse response = aiService.chat(
                request.getMessage(), 
                request.getCustomerId(), 
                request.getSessionId()
        );
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "AI response generated successfully",
                response
        ));
    }
}

