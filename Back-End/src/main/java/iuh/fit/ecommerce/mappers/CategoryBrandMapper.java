package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse;
import iuh.fit.ecommerce.entities.CategoryBrand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CategoryBrandMapper {

    // Lấy một instance của mapper (nếu không dùng @Autowired)
    CategoryBrandMapper INSTANCE = Mappers.getMapper(CategoryBrandMapper.class);

    /**
     * Chuyển đổi từ Entity CategoryBrand sang CategoryBrandResponse DTO.
     * MapStruct sẽ tự động hiểu:
     * - entity.getId() -> response.getId()
     * - entity.getCategory().getId() -> response.getCategoryId()
     * - entity.getCategory().getName() -> response.getCategoryName()
     * - entity.getBrand().getId() -> response.getBrandId()
     * - entity.getBrand().getName() -> response.getBrandName()
     */
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "brand.id", target = "brandId")
    @Mapping(source = "brand.name", target = "brandName")
    CategoryBrandResponse toResponse(CategoryBrand entity);
}