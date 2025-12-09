package iuh.fit.ecommerce.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @GetMapping("/500-error")
    public void test500Error() {
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Test 500 error for monitoring system"
        );
    }

    @GetMapping("/503-error")
    public void test503Error() {
        throw new ResponseStatusException(
            HttpStatus.SERVICE_UNAVAILABLE,
            "Test 503 error for monitoring system"
        );
    }

    @GetMapping("/runtime-error")
    public void testRuntimeError() {
        throw new RuntimeException("Test runtime exception for monitoring system");
    }


    @GetMapping("/slow-response")
    public String testSlowResponse() throws InterruptedException {
        Thread.sleep(5000);
        return "Slow response completed";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
