package iuh.fit.ecommerce.services.excel;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.dtos.excel.SupplierExcelDTO;
import iuh.fit.ecommerce.entities.Supplier;
import iuh.fit.ecommerce.repositories.SupplierRepository;
import iuh.fit.ecommerce.utils.excel.BaseExcelHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierExcelService extends BaseExcelHandler<SupplierExcelDTO> {

    private final SupplierRepository supplierRepository;

    @Override
    public String[] getHeaders() {
        return new String[]{
                "Tên nhà cung cấp*",
                "Số điện thoại*",
                "Địa chỉ",
                "Trạng thái (True/False)"
        };
    }

    @Override
    public List<SupplierExcelDTO> parseExcel(MultipartFile file) throws Exception {
        List<SupplierExcelDTO> dataList = new ArrayList<>();

        // LOG DEBUG: Bắt đầu đọc file
        System.out.println(">>> START PARSING EXCEL: " + file.getOriginalFilename());

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // QUAN TRỌNG: Sửa dòng bắt đầu đọc dữ liệu
            // 0 là Header -> Dữ liệu bắt đầu từ 1.
            // Nếu Template của bạn có 3 dòng tiêu đề trang trí thì sửa lại thành 3.
            int dataStartRow = 1;

            System.out.println(">>> Total Rows in Sheet: " + sheet.getLastRowNum());

            for (int i = dataStartRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }

                try {
                    SupplierExcelDTO dto = SupplierExcelDTO.builder()
                            .supplierName(getCellValueAsString(row.getCell(0)))
                            .phone(getCellValueAsString(row.getCell(1)))
                            .address(getCellValueAsString(row.getCell(2)))
                            .status(parseBooleanCell(row.getCell(3)))
                            .build();

                    dataList.add(dto);
                    // System.out.println(">>> Read Row " + i + ": " + dto.getSupplierName());
                } catch (Exception e) {
                    System.err.println(">>> Error reading row " + i + ": " + e.getMessage());
                }
            }
        }
        System.out.println(">>> END PARSING: Found " + dataList.size() + " records.");
        return dataList;
    }

    // Biến dùng tạm để check trùng lặp SĐT trong chính file Excel đang import
    private Set<String> tempPhoneSet = new HashSet<>();

    @Override
    public void validateRow(SupplierExcelDTO data, int rowIndex, ImportResult result) {
        // Reset set khi bắt đầu validate dòng đầu tiên (Logic này hơi thủ công,
        // đúng ra nên làm ở pre-process, nhưng để đơn giản ta clear nếu rowIndex nhỏ)
        if (rowIndex <= 1) tempPhoneSet.clear();

        // 1. Validate Tên
        if (data.getSupplierName() == null || data.getSupplierName().isBlank()) {
            result.addError(rowIndex, "Tên nhà cung cấp", "Tên không được để trống");
        }

        // 2. Validate Phone
        String phone = data.getPhone();
        if (phone == null || phone.isBlank()) {
            result.addError(rowIndex, "Số điện thoại", "Số điện thoại không được để trống");
        } else {
            // Chuẩn hóa sđt (xóa khoảng trắng)
            phone = phone.trim();
            data.setPhone(phone); // Cập nhật lại vào DTO

            if (!phone.matches("^0\\d{9,10}$")) {
                result.addError(rowIndex, "Số điện thoại", "SĐT không hợp lệ (phải bắt đầu bằng 0, 10-11 số)");
            } else {
                // Check trùng trong DB
                if (supplierRepository.existsByPhone(phone)) {
                    result.addError(rowIndex, "Số điện thoại", "Số điện thoại đã tồn tại trong hệ thống: " + phone);
                }
                // Check trùng trong chính file Excel này
                else if (tempPhoneSet.contains(phone)) {
                    result.addError(rowIndex, "Số điện thoại", "Số điện thoại bị trùng lặp trong file Excel: " + phone);
                } else {
                    tempPhoneSet.add(phone);
                }
            }
        }

        // Log lỗi ra console để debug
        if (result.hasErrors()) {
            System.out.println(">>> VALIDATION ERROR at Row " + rowIndex + ": " + result.getErrors().get(0).getMessage());
        }
    }

    @Override
    @Transactional
    public void saveData(List<SupplierExcelDTO> dataList) throws Exception {
        System.out.println(">>> PREPARING TO SAVE: " + dataList.size() + " records.");

        if (dataList.isEmpty()) {
            System.out.println(">>> NO DATA TO SAVE. (Maybe all rows failed validation?)");
            return;
        }

        int CHUNK_SIZE = 100;
        int countSaved = 0;

        for (int i = 0; i < dataList.size(); i += CHUNK_SIZE) {
            int end = Math.min(i + CHUNK_SIZE, dataList.size());
            List<SupplierExcelDTO> chunk = dataList.subList(i, end);
            List<Supplier> supplierList = new ArrayList<>();

            for (SupplierExcelDTO dto : chunk) {
                Supplier supplier = Supplier.builder()
                        .name(dto.getSupplierName())
                        .phone(dto.getPhone())
                        .address(dto.getAddress())
                        .status(dto.getStatus() != null ? dto.getStatus() : true)
                        .build();

                supplierList.add(supplier);
            }

            try {
                supplierRepository.saveAll(supplierList);
                countSaved += supplierList.size();
                System.out.println(">>> Chunk saved: " + supplierList.size() + " items.");
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println(">>> ERROR SAVING CHUNK: " + e.getMessage());
                throw e; // Ném lỗi để Transaction rollback nếu cần
            }
        }

        System.out.println(">>> TOTAL SAVED SUCCESSFULLY: " + countSaved);
    }

    @Override
    public Object[] mapToRow(SupplierExcelDTO data) {
        return new Object[]{
                data.getSupplierName(),
                data.getPhone(),
                data.getAddress(),
                data.getStatus() != null ? data.getStatus() : true
        };
    }

    public Workbook exportAllSuppliers() throws Exception {
        List<Supplier> supplierList = supplierRepository.findAll();
        List<SupplierExcelDTO> dtoList = supplierList.stream()
                .map(supplier -> SupplierExcelDTO.builder()
                        .supplierName(supplier.getName())
                        .phone(supplier.getPhone())
                        .address(supplier.getAddress())
                        .status(supplier.getStatus())
                        .build())
                .toList();

        return generateExcel(dtoList);
    }

    private boolean isEmptyRow(Row row) {
        if (row == null) return true;
        // Kiểm tra 2 cột đầu (Tên, SĐT)
        for (int i = 0; i < 2; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && !getCellValueAsString(cell).trim().isEmpty()) {
                return false; // Có dữ liệu -> không rỗng
            }
        }
        return true;
    }

    private Boolean parseBooleanCell(Cell cell) {
        if (cell == null) return true;
        String val = getCellValueAsString(cell).trim().toLowerCase();
        // Mở rộng các trường hợp true
        return val.equals("true") || val.equals("1") || val.equals("yes") || val.equals("active") || val.equals("hoạt động");
    }
}