package iuh.fit.ecommerce.dtos.request.product;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class ProductAddRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm tối đa 255 ký tự")
    private String name;

    @NotBlank(message = "SPU không được để trống")
    private String spu;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private Integer stock;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giảm giá không được nhỏ hơn 0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Giảm giá không được lớn hơn 1 (100%)")
    private Double discount;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotBlank(message = "Ảnh thumbnail không được để trống")
    private String thumbnail;

    private boolean status = true;

    @NotNull(message = "Thương hiệu không được để trống")
    private Long brandId;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotEmpty(message = "Danh sách ảnh sản phẩm không được rỗng")
    private List<@NotBlank(message = "URL ảnh không được rỗng") String> productImages;

    private List<ProductAttributeRequest> attributes;

    private List<ProductVariantRequest> variants;
}
