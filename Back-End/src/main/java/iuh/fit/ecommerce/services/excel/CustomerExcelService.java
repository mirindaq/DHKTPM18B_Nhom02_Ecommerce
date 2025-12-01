package iuh.fit.ecommerce.services.excel;

import iuh.fit.ecommerce.dtos.excel.CustomerExcelDTO;
import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.entities.Address;
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
    
    @Override
    public String[] getHeaders() {
        return new String[]{
            "Email*",
            "Họ tên*",
            "Số điện thoại*",
            "Địa chỉ",
            "Ghi chú"
        };
    }
    
    @Override
    public List<CustomerExcelDTO> parseExcel(MultipartFile file) throws Exception {
        List<CustomerExcelDTO> dataList = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
        
            for (int i = DATA_START_ROW_INDEX; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }
                
                CustomerExcelDTO dto = CustomerExcelDTO.builder()
                    .email(getCellValueAsString(row.getCell(0)))
                    .fullName(getCellValueAsString(row.getCell(1)))
                    .phone(getCellValueAsString(row.getCell(2)))
                    .address(getCellValueAsString(row.getCell(3)))
                    .note(getCellValueAsString(row.getCell(4)))
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
        
        Ranking defaultRanking = rankingRepository.findByName("S-NEW");
        
        List<Customer> customerList = new ArrayList<>();
        
        for (CustomerExcelDTO dto : dataList) {
            Customer customer = Customer.builder()
                .email(dto.getEmail())
                .fullName(dto.getFullName())
                .password(passwordEncoder.encode("123456")) // Default password
                .phone(dto.getPhone())
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
        log.info("Successfully imported {} customers", customerList.size());
    }
    
    @Override
    public Object[] mapToRow(CustomerExcelDTO data) {
        return new Object[]{
            data.getEmail(),
            data.getFullName(),
            data.getPhone(),
            data.getAddress(),
            data.getNote() != null ? data.getNote() : ""
        };
    }
    

    public Workbook exportAllCustomers() throws Exception {
        List<Customer> customerList = customerRepository.findAll();
        List<CustomerExcelDTO> dtoList = customerList.stream()
            .map(customer -> {
                // Get first address if exists
                String address = "";
                if (customer.getAddresses() != null && !customer.getAddresses().isEmpty()) {
                    Address addr = customer.getAddresses().get(0);
                    address = addr.getSubAddress() != null ? addr.getSubAddress() : "";
                }
                
                return CustomerExcelDTO.builder()
                    .email(customer.getEmail())
                    .fullName(customer.getFullName())
                    .phone(customer.getPhone())
                    .address(address)
                    .note("")
                    .build();
            })
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
}
