package iuh.fit.ecommerce.services.excel;

import iuh.fit.ecommerce.dtos.excel.ImportProgress;
import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.dtos.excel.StaffExcelDTO;
import iuh.fit.ecommerce.services.ImportProgressService;
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
    private final ImportProgressService progressService;
    
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
        
     
        String encodedPassword = passwordEncoder.encode("123456");
        
        int CHUNK_SIZE = 100; // Process 100 records per chunk
        int totalChunks = (dataList.size() + CHUNK_SIZE - 1) / CHUNK_SIZE;
        
        log.info("Starting import of {} staff members in {} chunks", dataList.size(), totalChunks);
        
     
        for (int i = 0; i < dataList.size(); i += CHUNK_SIZE) {
            int end = Math.min(i + CHUNK_SIZE, dataList.size());
            List<StaffExcelDTO> chunk = dataList.subList(i, end);
            
            List<Staff> staffList = new ArrayList<>();
            
            for (StaffExcelDTO dto : chunk) {
                Staff staff = Staff.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .password(encodedPassword) 
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
            
            int currentChunk = (i / CHUNK_SIZE) + 1;
            double progress = (currentChunk * 100.0) / totalChunks;
            log.info("Processed chunk {}/{} ({} records) - Progress: {:.1f}%", 
                     currentChunk, totalChunks, staffList.size(), progress);
        }
        
        log.info("Successfully imported {} staff members", dataList.size());
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
    
    // Method with progress tracking for async import
    @Transactional
    public void saveDataWithProgress(List<StaffExcelDTO> dataList, String jobId) throws Exception {
        Role staffRole = roleRepository.findByName("STAFF")
            .orElseThrow(() -> new RuntimeException("Role STAFF not found"));
        
        String encodedPassword = passwordEncoder.encode("123456");
        
        int CHUNK_SIZE = 100;
        int totalChunks = (dataList.size() + CHUNK_SIZE - 1) / CHUNK_SIZE;
        long startTime = System.currentTimeMillis();
        
        log.info("Starting import of {} staff members in {} chunks (jobId: {})", dataList.size(), totalChunks, jobId);
        
        for (int i = 0; i < dataList.size(); i += CHUNK_SIZE) {
            int end = Math.min(i + CHUNK_SIZE, dataList.size());
            List<StaffExcelDTO> chunk = dataList.subList(i, end);
            
            List<Staff> staffList = new ArrayList<>();
            
            for (StaffExcelDTO dto : chunk) {
                Staff staff = Staff.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .password(encodedPassword)
                    .phone(dto.getPhone())
                    .address(dto.getAddress())
                    .dateOfBirth(dto.getDateOfBirth())
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
            
            int currentChunk = (i / CHUNK_SIZE) + 1;
            int processedRecords = end;
            double percentage = (processedRecords * 100.0) / dataList.size();
            
            long elapsed = System.currentTimeMillis() - startTime;
            long estimatedTotal = (long) (elapsed / percentage * 100);
            long remaining = Math.max(0, (estimatedTotal - elapsed) / 1000);
            
            log.info("Processed chunk {}/{} - Progress: {:.1f}%", currentChunk, totalChunks, percentage);
            
            if (jobId != null) {
                progressService.sendProgress(jobId, ImportProgress.builder()
                    .totalRecords(dataList.size())
                    .processedRecords(processedRecords)
                    .currentChunk(currentChunk)
                    .totalChunks(totalChunks)
                    .percentage(percentage)
                    .estimatedTimeRemaining(remaining)
                    .status("processing")
                    .message("Đang xử lý chunk " + currentChunk + "/" + totalChunks)
                    .build());
            }
        }
        
        log.info("Successfully imported {} staff members", dataList.size());
        
        if (jobId != null) {
            progressService.complete(jobId, ImportProgress.builder()
                .totalRecords(dataList.size())
                .processedRecords(dataList.size())
                .currentChunk(totalChunks)
                .totalChunks(totalChunks)
                .percentage(100.0)
                .estimatedTimeRemaining(0)
                .status("completed")
                .message("Import hoàn tất thành công " + dataList.size() + " nhân viên")
                .build());
        }
    }
}
