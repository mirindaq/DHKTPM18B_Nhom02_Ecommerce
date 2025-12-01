package iuh.fit.ecommerce.utils.excel;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ExcelImporter<T> {

    List<T> parseExcel(MultipartFile file) throws Exception;

    void validateRow(T data, int rowIndex, ImportResult result);

    void saveData(List<T> data) throws Exception;

    ImportResult importExcel(MultipartFile file);
}
