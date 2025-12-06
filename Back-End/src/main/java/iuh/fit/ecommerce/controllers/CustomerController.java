package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.services.ImportProgressService;
import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerProfileRequest;
import iuh.fit.ecommerce.dtos.request.customer.UpdatePushTokenRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.services.CustomerService;
import iuh.fit.ecommerce.services.excel.CustomerExcelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private final CustomerExcelService customerExcelService;
    private final ImportProgressService importProgressService;

    @PostMapping(value = "")
    public ResponseEntity<ResponseSuccess<CustomerResponse>> createUser(
            @Valid @RequestBody CustomerAddRequest customerAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Customer success",
                customerService.createCustomer(customerAddRequest)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<CustomerResponse>> getCustomerById(@PathVariable long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Customer Profile success",
                customerService.getCustomerById(id)));
    }

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<CustomerResponse>>>> getAllCustomers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int limit,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String rank)

    {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Customers success",
                customerService.getAllCustomers(page, limit, name, phone, email, status, startDate, endDate, rank)));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ResponseSuccess<CustomerResponse>> updateCustomer(@PathVariable long id,
            @Valid @RequestBody CustomerProfileRequest customerProfileRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Customer success",
                customerService.updateCustomer(id, customerProfileRequest)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseSuccess<String>> deleteCustomer(@PathVariable long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete Customer success",
                "Deleted successfully"));
    }

    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusCustomer(@PathVariable Long id) {
        customerService.changeStatusCustomer(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status customer success",
                null));
    }

    @PutMapping("/update-push-token")
    public ResponseEntity<ResponseSuccess<Void>> updatePushToken(
            @Valid @RequestBody UpdatePushTokenRequest request) {

        customerService.updateExpoPushToken(request.getExpoPushToken());
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update push token successfully",
                null));
    }

    // Customer import
    @GetMapping("/template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadTemplate() {
        try {
            Workbook workbook = customerExcelService.generateTemplate();
            byte[] bytes = customerExcelService.workbookToBytes(workbook);

            ByteArrayResource resource = new ByteArrayResource(bytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customer_template.xlsx")
                    .contentType(MediaType
                            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<ImportResult>> importCustomers(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is null or empty! Please select a valid Excel file.");
            }
            
            System.out.println("Received file: " + file.getOriginalFilename() + ", Size: " + file.getSize());
            
            ImportResult result = customerExcelService.importExcel(file);

            return ResponseEntity.ok(new ResponseSuccess<>(
                    result.hasErrors() ? OK : CREATED,
                    result.getMessage(),
                    result));
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Import failed: " + e.getMessage(), e);
        }
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> exportCustomers() {
        try {
            Workbook workbook = customerExcelService.exportAllCustomers();
            byte[] bytes = customerExcelService.workbookToBytes(workbook);

            ByteArrayResource resource = new ByteArrayResource(bytes);

            String filename = "customers_" + LocalDate.now() + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType
                            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export customers: " + e.getMessage());
        }
    }

    
    @PostMapping("/{customerId}/addresses")
    public ResponseEntity<ResponseSuccess<?>> addAddressForCustomer(
            @PathVariable Long customerId,
            @Valid @RequestBody iuh.fit.ecommerce.dtos.request.address.AddressRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Add address for customer success",
                customerService.addAddressForCustomer(customerId, request)));
    }

    @PutMapping("/{customerId}/addresses/{addressId}")
    public ResponseEntity<ResponseSuccess<?>> updateAddressForCustomer(
            @PathVariable Long customerId,
            @PathVariable Long addressId,
            @Valid @RequestBody iuh.fit.ecommerce.dtos.request.address.AddressRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update address for customer success",
                customerService.updateAddressForCustomer(customerId, addressId, request)));
    }

    @DeleteMapping("/{customerId}/addresses/{addressId}")
    public ResponseEntity<ResponseSuccess<Void>> deleteAddressForCustomer(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        customerService.deleteAddressForCustomer(customerId, addressId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete address for customer success",
                null));
    }
    
    // SSE endpoint for progress tracking
    @GetMapping("/import-progress/{jobId}")
    public SseEmitter getImportProgress(@PathVariable String jobId) {
        return importProgressService.createEmitter(jobId);
    }
    
    // Async import endpoint
    @PostMapping("/import-async")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<Map<String, String>>> importCustomersAsync(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is null or empty! Please select a valid Excel file.");
            }
            
            String jobId = UUID.randomUUID().toString();
            
            // Start async import with progress tracking
            CompletableFuture.runAsync(() -> {
                try {
                    // Parse Excel
                    var dataList = customerExcelService.parseExcel(file);
                    ImportResult result = ImportResult.builder()
                            .totalRows(dataList.size())
                            .successCount(0)
                            .errorCount(0)
                            .errors(new java.util.ArrayList<>())
                            .build();
                    
                    // Validate all rows
                    var validData = new java.util.ArrayList<iuh.fit.ecommerce.dtos.excel.CustomerExcelDTO>();
                    for (int i = 0; i < dataList.size(); i++) {
                        final int rowIndex = i + 4;
                        customerExcelService.validateRow(dataList.get(i), rowIndex, result);
                        if (!result.getErrors().stream().anyMatch(e -> e.getRowIndex() == rowIndex)) {
                            validData.add(dataList.get(i));
                        }
                    }
                    
                    if (validData.isEmpty()) {
                        importProgressService.sendError(jobId, "No valid data to import");
                        return;
                    }
                    
                    // Save with progress tracking
                    customerExcelService.saveDataWithProgress(validData, jobId);
                    
                } catch (Exception e) {
                    importProgressService.sendError(jobId, "Import failed: " + e.getMessage());
                }
            });
            
            return ResponseEntity.ok(new ResponseSuccess<>(
                    OK,
                    "Import started",
                    Map.of("jobId", jobId)));
        } catch (Exception e) {
            throw new RuntimeException("Failed to start import: " + e.getMessage(), e);
        }
    }

}
