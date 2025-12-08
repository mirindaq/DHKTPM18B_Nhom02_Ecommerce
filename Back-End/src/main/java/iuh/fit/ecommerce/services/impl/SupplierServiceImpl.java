package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.entities.Supplier;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.SupplierMapper;
import iuh.fit.ecommerce.repositories.SupplierRepository;
import iuh.fit.ecommerce.services.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public ResponseWithPagination<List<SupplierResponse>> getSuppliers(
            int page, int size,
            String name, String phone, String address, Boolean status,
            LocalDate startDate, LocalDate endDate) {

        page = Math.max(0, page - 1); // Trừ 1 để khớp với Pageable (bắt đầu từ 0)
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Supplier> supplierPage = supplierRepository.searchSuppliers(
                name, phone, address, status, startDate, endDate, pageable
        );

        return ResponseWithPagination.fromPage(supplierPage, supplierMapper::toResponse);
    }

    @Override
    public SupplierResponse getSupplierById(String id) {
        Supplier supplier = getSupplierEntityById(id);
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        // 1. Validate (kiểm tra SĐT đã tồn tại chưa)
        validateSupplierPhone(request.getPhone());

        // 2. Map DTO sang Entity
        Supplier newSupplier = supplierMapper.toSupplier(request);
        newSupplier.setStatus(true); // Mặc định là active khi tạo mới

        // 3. Lưu vào DB (ID sẽ được tự tạo bằng UUID)
        Supplier savedSupplier = supplierRepository.save(newSupplier);

        // 4. Map sang Response
        return supplierMapper.toResponse(savedSupplier);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(String id, SupplierRequest request) {
        // 1. Lấy Entity
        Supplier existingSupplier = getSupplierEntityById(id);

        // 2. Validate SĐT (nếu SĐT bị thay đổi)
        if (!existingSupplier.getPhone().equals(request.getPhone())) {
            validateSupplierPhone(request.getPhone(), id);
        }

        // 3. Cập nhật các trường
        supplierMapper.updateFromRequest(request, existingSupplier);

        // 4. Lưu lại
        Supplier updatedSupplier = supplierRepository.save(existingSupplier);

        // 5. Trả về
        return supplierMapper.toResponse(updatedSupplier);
    }

    @Override
    @Transactional
    public void changeStatusSupplier(String id) {
        Supplier supplier = getSupplierEntityById(id);
        supplier.setStatus(!supplier.getStatus()); // Đảo ngược trạng thái
        supplierRepository.save(supplier);
    }

    // --- PRIVATE HELPERS ---

    @Override
    public Supplier getSupplierEntityById(String id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp với ID: " + id));
    }

    // Dùng cho Create
    private void validateSupplierPhone(String phone) {
        if (supplierRepository.existsByPhone(phone)) {
            throw new ConflictException("Số điện thoại này đã được sử dụng.");
        }
    }

    // Dùng cho Update
    private void validateSupplierPhone(String phone, String id) {
        if (supplierRepository.existsByPhoneAndIdNot(phone, id)) {
            throw new ConflictException("Số điện thoại này đã được sử dụng.");
        }
    }
}