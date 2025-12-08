package iuh.fit.ecommerce.utils.excel;

import org.apache.poi.ss.usermodel.Workbook;
import java.util.List;

public interface ExcelExporter<T> {

    Workbook generateExcel(List<T> data) throws Exception;

    Workbook generateTemplate() throws Exception;

    String[] getHeaders();

    Object[] mapToRow(T data);
}
