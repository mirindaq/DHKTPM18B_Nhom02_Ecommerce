package iuh.fit.ecommerce.dtos.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {
    private int totalRows;
    private int successCount;
    private int errorCount;
    
    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();
    
    private String message;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private int rowIndex;
        private String field;
        private String message;
    }
    
    public void addError(int rowIndex, String field, String message) {
        if (errors == null) {
            errors = new ArrayList<>();
        }
        errors.add(ImportError.builder()
                .rowIndex(rowIndex)
                .field(field)
                .message(message)
                .build());
        errorCount++;
    }
    
    public boolean hasErrors() {
        return errorCount > 0;
    }
}
