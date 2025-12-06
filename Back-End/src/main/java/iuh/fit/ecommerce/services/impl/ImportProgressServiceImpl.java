package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.excel.ImportProgress;
import iuh.fit.ecommerce.services.ImportProgressService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ImportProgressServiceImpl implements ImportProgressService {
    
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    
    @Override
    public SseEmitter createEmitter(String jobId) {
        SseEmitter emitter = new SseEmitter(300000L); // 5 minutes timeout
        emitters.put(jobId, emitter);
        
        emitter.onCompletion(() -> {
            log.info("SSE completed for jobId: {}", jobId);
            emitters.remove(jobId);
        });
        
        emitter.onTimeout(() -> {
            log.warn("SSE timeout for jobId: {}", jobId);
            emitters.remove(jobId);
        });
        
        emitter.onError((e) -> {
            log.error("SSE error for jobId: {}", jobId, e);
            emitters.remove(jobId);
        });
        
        return emitter;
    }
    
    @Override
    public void sendProgress(String jobId, ImportProgress progress) {
        SseEmitter emitter = emitters.get(jobId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("progress")
                    .data(progress));
                log.debug("Sent progress for jobId {}: {}%", jobId, progress.getPercentage());
            } catch (IOException e) {
                log.error("Failed to send progress for jobId: {}", jobId, e);
                emitters.remove(jobId);
            }
        }
    }
    
    @Override
    public void complete(String jobId, ImportProgress progress) {
        SseEmitter emitter = emitters.get(jobId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("complete")
                    .data(progress));
                emitter.complete();
                log.info("Import completed for jobId: {}", jobId);
            } catch (IOException e) {
                log.error("Failed to complete SSE for jobId: {}", jobId, e);
            } finally {
                emitters.remove(jobId);
            }
        }
    }
    
    @Override
    public void sendError(String jobId, String errorMessage) {
        SseEmitter emitter = emitters.get(jobId);
        if (emitter != null) {
            try {
                ImportProgress errorProgress = ImportProgress.builder()
                    .status("error")
                    .message(errorMessage)
                    .build();
                
                emitter.send(SseEmitter.event()
                    .name("error")
                    .data(errorProgress));
                emitter.complete();
                log.error("Import error for jobId {}: {}", jobId, errorMessage);
            } catch (IOException e) {
                log.error("Failed to send error for jobId: {}", jobId, e);
            } finally {
                emitters.remove(jobId);
            }
        }
    }
}
