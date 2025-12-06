package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.excel.ImportProgress;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface ImportProgressService {
    SseEmitter createEmitter(String jobId);
    void sendProgress(String jobId, ImportProgress progress);
    void complete(String jobId, ImportProgress progress);
    void sendError(String jobId, String errorMessage);
}
