package iuh.fit.ecommerce.dtos.request.product;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class ProductVariantRequest {

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", message = "Giá phải lớn hơn hoặc bằng 0")
    private Double price;

    @DecimalMin(value = "0.0", message = "Giá cũ phải lớn hơn hoặc bằng 0")
    private Double oldPrice;

    @NotBlank(message = "SKU không được để trống")
    private String sku;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stock;

    @NotEmpty(message = "Danh sách variantValueIds không được rỗng")
    private List<Long> variantValueIds;
}
