package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.purchaseOrder.PurchaseOrderDetailRequest;
import iuh.fit.ecommerce.dtos.request.purchaseOrder.PurchaseOrderRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.purchaseOrder.PurchaseOrderResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.PurchaseOrderDetailMapper;
import iuh.fit.ecommerce.mappers.PurchaseOrderMapper;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.PurchaseOrderService;
import iuh.fit.ecommerce.specifications.PurchaseOrderSpecification;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderDetailRepository purchaseOrderDetailRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final SecurityUtils securityUtils;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final PurchaseOrderDetailMapper purchaseOrderDetailMapper;

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        // Get current staff
        Staff staff = securityUtils.getCurrentStaff();

        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        if (!supplier.getStatus()) {
            throw new IllegalArgumentException("Supplier is inactive");
        }

        // Create purchase order
        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setPurchaseDate(LocalDateTime.now());
        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setStaff(staff);
        purchaseOrder.setNote(request.getNote());

        // Calculate total price and create details
        double totalPrice = 0.0;
        List<PurchaseOrderDetail> details = new ArrayList<>();

        for (PurchaseOrderDetailRequest detailRequest : request.getDetails()) {
            ProductVariant productVariant = productVariantRepository.findById(detailRequest.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + detailRequest.getProductVariantId()));

            PurchaseOrderDetail detail = new PurchaseOrderDetail();
            detail.setPurchaseOrder(purchaseOrder);
            detail.setProductVariant(productVariant);
            detail.setQuantity(detailRequest.getQuantity());
            detail.setPrice(detailRequest.getPrice());

            totalPrice += detailRequest.getPrice() * detailRequest.getQuantity();
            details.add(detail);

            // Update product variant stock
            productVariant.setStock(productVariant.getStock() + detailRequest.getQuantity().intValue());
            productVariantRepository.save(productVariant);
        }

        purchaseOrder.setTotalPrice(totalPrice);

        // Save purchase order and details
        PurchaseOrder savedPurchaseOrder = purchaseOrderRepository.save(purchaseOrder);
        purchaseOrderDetailRepository.saveAll(details);

        // Build response
        PurchaseOrderResponse response = purchaseOrderMapper.toResponse(savedPurchaseOrder);
        response.setDetails(details.stream()
                .map(purchaseOrderDetailMapper::toResponse)
                .toList());

        return response;
    }

    @Override
    public ResponseWithPagination<List<PurchaseOrderResponse>> getAllPurchaseOrders(
            int page, 
            int size,
            String supplierId,
            String supplierName,
            LocalDate startDate,
            LocalDate endDate
    ) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "id"));

        Specification<PurchaseOrder> spec = (root, query, criteriaBuilder) -> 
            criteriaBuilder.conjunction();

        if (supplierId != null && !supplierId.isBlank()) {
            spec = spec.and(PurchaseOrderSpecification.hasSupplierId(supplierId));
        }

        if (supplierName != null && !supplierName.isBlank()) {
            spec = spec.and(PurchaseOrderSpecification.hasSupplierName(supplierName));
        }

        if (startDate != null) {
            spec = spec.and(PurchaseOrderSpecification.hasStartDate(startDate));
        }

        if (endDate != null) {
            spec = spec.and(PurchaseOrderSpecification.hasEndDate(endDate));
        }

        Page<PurchaseOrder> purchaseOrderPage = purchaseOrderRepository.findAll(spec, pageable);

        List<PurchaseOrderResponse> responses = purchaseOrderPage.getContent().stream()
                .map(po -> {
                    PurchaseOrderResponse response = purchaseOrderMapper.toResponse(po);
                    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());
                    response.setDetails(details.stream()
                            .map(purchaseOrderDetailMapper::toResponse)
                            .toList());
                    return response;
                })
                .toList();

        return ResponseWithPagination.<List<PurchaseOrderResponse>>builder()
                .data(responses)
                .totalPage(purchaseOrderPage.getTotalPages())
                .totalItem(purchaseOrderPage.getTotalElements())
                .page(page)
                .limit(size)
                .build();
    }

    @Override
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        PurchaseOrderResponse response = purchaseOrderMapper.toResponse(purchaseOrder);
        
        List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(id);
        response.setDetails(details.stream()
                .map(purchaseOrderDetailMapper::toResponse)
                .toList());

        return response;
    }
}
