package iuh.fit.ecommerce.services.excel;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.dtos.excel.StaffExcelDTO;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.enums.WorkStatus;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.utils.excel.BaseExcelHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffExcelService extends BaseExcelHandler<StaffExcelDTO> {
    
    private final StaffRepository staffRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    @Override
    public String[] getHeaders() {
        return new String[]{
            "Email*",
            "Họ tên*",
            "Số điện thoại*",
            "Địa chỉ",
            "Ngày sinh (dd/MM/yyyy)",
            "Ngày vào làm (dd/MM/yyyy)",
            "Team leader(true/false)"
        };
    }
    
    @Override
    public List<StaffExcelDTO> parseExcel(MultipartFile file) throws Exception {
        List<StaffExcelDTO> dataList = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Start from row 3 (index 3) because rows 0-1 are instructions, row 2 is header
            int dataStartRow = 3;
    
            for (int i = dataStartRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }
                
                StaffExcelDTO dto = StaffExcelDTO.builder()
                    .email(getCellValueAsString(row.getCell(0)))
                    .fullName(getCellValueAsString(row.getCell(1)))
                    .phone(getCellValueAsString(row.getCell(2)))
                    .address(getCellValueAsString(row.getCell(3)))
                    .dateOfBirth(parseDateCell(row.getCell(4)))
                    .joinDate(parseDateCell(row.getCell(5)))
                    .isLeader(parseBooleanCell(row.getCell(6)))
                    .build();
                
                dataList.add(dto);
            }
        }
        
        return dataList;
    }
    
    @Override
    public void validateRow(StaffExcelDTO data, int rowIndex, ImportResult result) {

        if (data.getEmail() == null || data.getEmail().isBlank()) {
            result.addError(rowIndex, "Email", "Email không được để trống");
        } else if (!data.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            result.addError(rowIndex, "Email", "Email không hợp lệ");
        } else if (staffRepository.existsByEmail(data.getEmail())) {
            result.addError(rowIndex, "Email", "Email đã tồn tại trong hệ thống");
        }
       
        if (data.getFullName() == null || data.getFullName().isBlank()) {
            result.addError(rowIndex, "Họ tên", "Họ tên không được để trống");
        }
        
        if (data.getPhone() == null || data.getPhone().isBlank()) {
            result.addError(rowIndex, "Số điện thoại", "Số điện thoại không được để trống");
        } else if (!data.getPhone().matches("^0\\d{9}$")) {
            result.addError(rowIndex, "Số điện thoại", "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)");
        }
        
        // Validate date of birth (optional, but if provided must be valid)
        if (data.getDateOfBirth() != null) {
            if (data.getDateOfBirth().isAfter(LocalDate.now())) {
                result.addError(rowIndex, "Ngày sinh", "Ngày sinh không được là ngày tương lai");
            } else if (data.getDateOfBirth().isBefore(LocalDate.of(1900, 1, 1))) {
                result.addError(rowIndex, "Ngày sinh", "Ngày sinh không hợp lệ");
            }
        }
     
        if (data.getJoinDate() != null && data.getJoinDate().isAfter(LocalDate.now())) {
            result.addError(rowIndex, "Ngày vào làm", "Ngày vào làm không được là ngày tương lai");
        }
    }
    
    @Override
    @Transactional
    public void saveData(List<StaffExcelDTO> dataList) throws Exception {
        Role staffRole = roleRepository.findByName("STAFF")
            .orElseThrow(() -> new RuntimeException("Role STAFF not found"));
        
        List<Staff> staffList = new ArrayList<>();
        
        for (StaffExcelDTO dto : dataList) {
            Staff staff = Staff.builder()
                .email(dto.getEmail())
                .fullName(dto.getFullName())
                .password(passwordEncoder.encode("123456")) // Default password
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .dateOfBirth(dto.getDateOfBirth()) // Optional
                .joinDate(dto.getJoinDate() != null ? dto.getJoinDate() : LocalDate.now())
                .leader(dto.getIsLeader() != null ? dto.getIsLeader() : false)
                .active(true)
                .workStatus(WorkStatus.ACTIVE)
                .build();
            
            staff.setUserRoles(new ArrayList<>());
            
            UserRole userRole = UserRole.builder()
                .role(staffRole)
                .user(staff)
                .build();
            
            staff.getUserRoles().add(userRole);
            staffList.add(staff);
        }
        
        staffRepository.saveAll(staffList);
        log.info("Successfully imported {} staff members", staffList.size());
    }
    
    @Override
    public Object[] mapToRow(StaffExcelDTO data) {
        return new Object[]{
            data.getEmail(),
            data.getFullName(),
            data.getPhone(),
            data.getAddress(),
            data.getDateOfBirth() != null ? data.getDateOfBirth().format(DATE_FORMATTER) : "",
            data.getJoinDate() != null ? data.getJoinDate().format(DATE_FORMATTER) : "",
            data.getIsLeader() != null ? data.getIsLeader() : false
        };
    }
  
    public Workbook exportAllStaff() throws Exception {
        List<Staff> staffList = staffRepository.findAll();
        List<StaffExcelDTO> dtoList = staffList.stream()
            .map(staff -> StaffExcelDTO.builder()
                .email(staff.getEmail())
                .fullName(staff.getFullName())
                .phone(staff.getPhone())
                .address(staff.getAddress())
                .dateOfBirth(staff.getDateOfBirth())
                .joinDate(staff.getJoinDate())
                .isLeader(staff.getLeader())
                .build())
            .toList();
        
        return generateExcel(dtoList);
    }
    
    
    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < 3; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && !getCellValueAsString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }
    
    private LocalDate parseDateCell(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        String dateStr = getCellValueAsString(cell);
        if (dateStr.isBlank()) {
            return null;
        }
        
        try {
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            log.warn("Failed to parse date: {}", dateStr);
            return null;
        }
    }
    
    private Boolean parseBooleanCell(Cell cell) {
        if (cell == null) {
            return false;
        }
        
        String value = getCellValueAsString(cell).toLowerCase();
        return value.equals("true") || value.equals("1") || value.equals("yes");
    }
}
