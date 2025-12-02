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
                // Row index in Excel: 3 (instruction rows) + 1 (header) + i (data index) = 4 + i
                int rowIndex = 4 + i;

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

        // Add instruction rows
        addInstructionRows(workbook, sheet);

        // Create header row (after instruction rows)
        int headerRowIndex = HEADER_ROW_INDEX + 2; // Skip 2 instruction rows
        Row headerRow = sheet.createRow(headerRowIndex);
        CellStyle requiredHeaderStyle = createRequiredHeaderStyle(workbook);
        CellStyle optionalHeaderStyle = createOptionalHeaderStyle(workbook);

        String[] headers = getHeaders();
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            
            // Apply style based on whether column is required (has *)
            if (headers[i].contains("*")) {
                cell.setCellStyle(requiredHeaderStyle);
            } else {
                cell.setCellStyle(optionalHeaderStyle);
            }
            
            sheet.autoSizeColumn(i);
        }

        return workbook;
    }

    protected void addInstructionRows(Workbook workbook, Sheet sheet) {
        CellStyle instructionStyle = workbook.createCellStyle();
        Font instructionFont = workbook.createFont();
        instructionFont.setItalic(true);
        instructionFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        instructionStyle.setFont(instructionFont);

        // Row 0: Required fields instruction
        Row row0 = sheet.createRow(0);
        Cell cell0 = row0.createCell(0);
        cell0.setCellValue("Hướng dẫn: Cột màu đỏ (*) là BẮT BUỘC, cột màu xanh là TÙY CHỌN");
        cell0.setCellStyle(instructionStyle);

        // Row 1: Note
        Row row1 = sheet.createRow(1);
        Cell cell1 = row1.createCell(0);
        cell1.setCellValue("Lưu ý: Bắt đầu nhập dữ liệu từ dòng 4 trở đi. Không xóa dòng tiêu đề!!!");
        cell1.setCellStyle(instructionStyle);
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

        CellType cellType = cell.getCellType();
        
        if (cellType == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cellType == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                return cell.getLocalDateTimeCellValue().toString();
            } else {
                return String.valueOf((long) cell.getNumericCellValue());
            }
        } else if (cellType == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        } else if (cellType == CellType.FORMULA) {
            return cell.getCellFormula();
        } else {
            return "";
        }
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

    protected CellStyle createRequiredHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        // Màu đỏ nhạt cho cột bắt buộc
        style.setFillForegroundColor(IndexedColors.CORAL.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    protected CellStyle createOptionalHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        // Màu xanh nhạt cho cột không bắt buộc
        style.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
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
