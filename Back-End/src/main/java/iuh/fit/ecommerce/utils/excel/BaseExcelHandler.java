package iuh.fit.ecommerce.utils.excel;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public abstract class BaseExcelHandler<T> implements ExcelImporter<T>, ExcelExporter<T> {

    protected static final int HEADER_ROW_INDEX = 0;
    protected static final int DATA_START_ROW_INDEX = 1;

    @Override
    public ImportResult importExcel(MultipartFile file) {
        ImportResult result = ImportResult.builder()
                .totalRows(0)
                .successCount(0)
                .errorCount(0)
                .errors(new ArrayList<>())
                .build();

        try {
            // Step 1:
            validateFile(file, result);
            if (result.hasErrors()) {
                result.setMessage("File validation failed");
                return result;
            }

            // Step 2:
            List<T> dataList = parseExcel(file);
            result.setTotalRows(dataList.size());

            if (dataList.isEmpty()) {
                result.setMessage("No data found in Excel file");
                return result;
            }

            // Step 3:
            List<T> validData = new ArrayList<>();
            for (int i = 0; i < dataList.size(); i++) {
                T data = dataList.get(i);
                int rowIndex = i + DATA_START_ROW_INDEX + 1;

                validateRow(data, rowIndex, result);

                if (!hasRowErrors(result, rowIndex)) {
                    validData.add(data);
                }
            }

            if (!validData.isEmpty()) {
                saveData(validData);
                result.setSuccessCount(validData.size());
            }

            if (result.hasErrors()) {
                result.setMessage(String.format(
                        "Import completed with errors. Success: %d, Failed: %d",
                        result.getSuccessCount(), result.getErrorCount()));
            } else {
                result.setMessage(String.format(
                        "Import successful. Total: %d records",
                        result.getSuccessCount()));
            }

        } catch (Exception e) {
            log.error("Error during Excel import", e);
            result.addError(0, "SYSTEM", "System error: " + e.getMessage());
            result.setMessage("Import failed: " + e.getMessage());
        }

        return result;
    }

    @Override
    public Workbook generateTemplate() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Template");

        // Create header row
        Row headerRow = sheet.createRow(HEADER_ROW_INDEX);
        CellStyle headerStyle = createHeaderStyle(workbook);

        String[] headers = getHeaders();
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.autoSizeColumn(i);
        }

        return workbook;
    }

    @Override
    public Workbook generateExcel(List<T> dataList) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Data");

        Row headerRow = sheet.createRow(HEADER_ROW_INDEX);
        CellStyle headerStyle = createHeaderStyle(workbook);

        String[] headers = getHeaders();
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        CellStyle dataStyle = createDataStyle(workbook);
        for (int i = 0; i < dataList.size(); i++) {
            Row row = sheet.createRow(i + DATA_START_ROW_INDEX);
            Object[] rowData = mapToRow(dataList.get(i));

            for (int j = 0; j < rowData.length; j++) {
                Cell cell = row.createCell(j);
                setCellValue(cell, rowData[j]);
                cell.setCellStyle(dataStyle);
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        return workbook;
    }

    public byte[] workbookToBytes(Workbook workbook) throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    protected void validateFile(MultipartFile file, ImportResult result) {
        if (file == null || file.isEmpty()) {
            result.addError(0, "FILE", "File is empty");
            return;
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            result.addError(0, "FILE", "Invalid file format. Only .xlsx and .xls are supported");
        }
    }

    protected boolean hasRowErrors(ImportResult result, int rowIndex) {
        return result.getErrors().stream()
                .anyMatch(error -> error.getRowIndex() == rowIndex);
    }

    protected String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                } else {
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    protected void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue(value.toString());
        }
    }

    protected CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    protected CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}
