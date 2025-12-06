package iuh.fit.ecommerce.dtos.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportProgress {
    private int totalRecords;
    private int processedRecords;
    private int currentChunk;
    private int totalChunks;
    private double percentage;
    private long estimatedTimeRemaining; // seconds
    private String status; // "processing", "completed", "error"
    private String message;
}
