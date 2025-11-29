package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.purchaseOrder.PurchaseOrderRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.purchaseOrder.PurchaseOrderResponse;

import java.time.LocalDate;
import java.util.List;

public interface PurchaseOrderService {
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request);
    
    ResponseWithPagination<List<PurchaseOrderResponse>> getAllPurchaseOrders(
            int page, 
            int size,
            String supplierId,
            String supplierName,
            LocalDate startDate,
            LocalDate endDate
    );
    
    PurchaseOrderResponse getPurchaseOrderById(Long id);
}



