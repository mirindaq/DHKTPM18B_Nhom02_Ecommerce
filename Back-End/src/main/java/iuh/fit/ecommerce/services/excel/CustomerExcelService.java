package iuh.fit.ecommerce.services.excel;

import iuh.fit.ecommerce.dtos.excel.CustomerExcelDTO;
import iuh.fit.ecommerce.dtos.excel.ImportProgress;
import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.services.ImportProgressService;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.repositories.RoleRepository;
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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerExcelService extends BaseExcelHandler<CustomerExcelDTO> {
    
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final RankingRepository rankingRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImportProgressService progressService;
    
    @Override
    public String[] getHeaders() {
        return new String[]{
            "Email*",
            "Họ tên*",
            "Số điện thoại*",
            "Ngày sinh (dd/MM/yyyy)"
        };
    }
    
    @Override
    public List<CustomerExcelDTO> parseExcel(MultipartFile file) throws Exception {
        List<CustomerExcelDTO> dataList = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
          
            int dataStartRow = 3;
        
            for (int i = dataStartRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }
                
                CustomerExcelDTO dto = CustomerExcelDTO.builder()
                    .email(getCellValueAsString(row.getCell(0)))
                    .fullName(getCellValueAsString(row.getCell(1)))
                    .phone(getCellValueAsString(row.getCell(2)))
                    .dateOfBirth(parseDateCell(row.getCell(3)))
                    .build();
                
                dataList.add(dto);
            }
        }
        
        return dataList;
    }
    
    @Override
    public void validateRow(CustomerExcelDTO data, int rowIndex, ImportResult result) {
        if (data.getEmail() == null || data.getEmail().isBlank()) {
            result.addError(rowIndex, "Email", "Email không được để trống");
        } else if (!data.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            result.addError(rowIndex, "Email", "Email không hợp lệ");
        } else if (customerRepository.existsByEmail(data.getEmail())) {
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
    }
    
    @Override
    @Transactional
    public void saveData(List<CustomerExcelDTO> dataList) throws Exception {
        Role customerRole = roleRepository.findByName("CUSTOMER")
            .orElseThrow(() -> new RuntimeException("Role CUSTOMER not found"));
        
       
        Ranking defaultRanking = rankingRepository.findAll().stream()
            .findFirst()
            .orElse(null);
        
        if (defaultRanking == null) {
            log.warn("No ranking found in database. Customers will be created without ranking.");
        }
        
      
        String encodedPassword = passwordEncoder.encode("123456");
        
        int CHUNK_SIZE = 100; // Process 100 records per chunk
        int totalChunks = (dataList.size() + CHUNK_SIZE - 1) / CHUNK_SIZE;
        
        log.info("Starting import of {} customers in {} chunks", dataList.size(), totalChunks);
        
   
        for (int i = 0; i < dataList.size(); i += CHUNK_SIZE) {
            int end = Math.min(i + CHUNK_SIZE, dataList.size());
            List<CustomerExcelDTO> chunk = dataList.subList(i, end);
            
            List<Customer> customerList = new ArrayList<>();
            
            for (CustomerExcelDTO dto : chunk) {
                Customer customer = Customer.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .password(encodedPassword) 
                    .phone(dto.getPhone())
                    .dateOfBirth(dto.getDateOfBirth()) 
                    .active(true)
                    .totalSpending(0.0)
                    .ranking(defaultRanking)
                    .build();
                
                customer.setUserRoles(new ArrayList<>());
                
                UserRole userRole = UserRole.builder()
                    .role(customerRole)
                    .user(customer)
                    .build();
                
                customer.getUserRoles().add(userRole);
                customerList.add(customer);
            }
            
            // Batch insert this chunk
            customerRepository.saveAll(customerList);
            
            int currentChunk = (i / CHUNK_SIZE) + 1;
            double progress = (currentChunk * 100.0) / totalChunks;
            log.info("Processed chunk {}/{} ({} records) - Progress: {:.1f}%", 
                     currentChunk, totalChunks, customerList.size(), progress);
        }
        
        log.info("Successfully imported {} customers", dataList.size());
    }
    
    @Override
    public Object[] mapToRow(CustomerExcelDTO data) {
        return new Object[]{
            data.getEmail(),
            data.getFullName(),
            data.getPhone(),
            data.getDateOfBirth() != null ? data.getDateOfBirth().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : ""
        };
    }
    

    public Workbook exportAllCustomers() throws Exception {
        List<Customer> customerList = customerRepository.findAll();
        List<CustomerExcelDTO> dtoList = customerList.stream()
            .map(customer -> CustomerExcelDTO.builder()
                .email(customer.getEmail())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .dateOfBirth(customer.getDateOfBirth())
                .build())
            .toList();
        
        return generateExcel(dtoList);
    }
    
    
    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < 3; i++) { // Check first 3 required columns
            Cell cell = row.getCell(i);
            if (cell != null && !getCellValueAsString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }
    
    private java.time.LocalDate parseDateCell(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        String dateStr = getCellValueAsString(cell);
        if (dateStr.isBlank()) {
            return null;
        }
        
        try {
            return java.time.LocalDate.parse(dateStr, java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            log.warn("Failed to parse date: {}", dateStr);
            return null;
        }
    }
    
    // Method with progress tracking for async import
    @Transactional
    public void saveDataWithProgress(List<CustomerExcelDTO> dataList, String jobId) throws Exception {
        Role customerRole = roleRepository.findByName("CUSTOMER")
            .orElseThrow(() -> new RuntimeException("Role CUSTOMER not found"));
        
        Ranking defaultRanking = rankingRepository.findAll().stream()
            .findFirst()
            .orElse(null);
        
        if (defaultRanking == null) {
            log.warn("No ranking found in database. Customers will be created without ranking.");
        }
        
        String encodedPassword = passwordEncoder.encode("123456");
        
        int CHUNK_SIZE = 100;
        int totalChunks = (dataList.size() + CHUNK_SIZE - 1) / CHUNK_SIZE;
        long startTime = System.currentTimeMillis();
        
        log.info("Starting import of {} customers in {} chunks (jobId: {})", dataList.size(), totalChunks, jobId);
        
        for (int i = 0; i < dataList.size(); i += CHUNK_SIZE) {
            int end = Math.min(i + CHUNK_SIZE, dataList.size());
            List<CustomerExcelDTO> chunk = dataList.subList(i, end);
            
            List<Customer> customerList = new ArrayList<>();
            
            for (CustomerExcelDTO dto : chunk) {
                Customer customer = Customer.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .password(encodedPassword)
                    .phone(dto.getPhone())
                    .dateOfBirth(dto.getDateOfBirth())
                    .active(true)
                    .totalSpending(0.0)
                    .ranking(defaultRanking)
                    .build();
                
                customer.setUserRoles(new ArrayList<>());
                
                UserRole userRole = UserRole.builder()
                    .role(customerRole)
                    .user(customer)
                    .build();
                
                customer.getUserRoles().add(userRole);
                customerList.add(customer);
            }
            
            customerRepository.saveAll(customerList);
            
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
        
        log.info("Successfully imported {} customers", dataList.size());
        
        if (jobId != null) {
            progressService.complete(jobId, ImportProgress.builder()
                .totalRecords(dataList.size())
                .processedRecords(dataList.size())
                .currentChunk(totalChunks)
                .totalChunks(totalChunks)
                .percentage(100.0)
                .estimatedTimeRemaining(0)
                .status("completed")
                .message("Import hoàn tất thành công " + dataList.size() + " khách hàng")
                .build());
        }
    }
}
