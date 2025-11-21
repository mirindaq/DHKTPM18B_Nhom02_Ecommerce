package iuh.fit.ecommerce.entities.elasticsearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.List;

@Document(indexName = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDocument {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Long)
    private Long productId;
    
    @Field(type = FieldType.Text, analyzer = "standard", searchAnalyzer = "standard")
    private String name;
    
    @Field(type = FieldType.Keyword)
    private String slug;
    
    @Field(type = FieldType.Text, analyzer = "standard", searchAnalyzer = "standard")
    private String description;
    
    @Field(type = FieldType.Keyword)
    private String thumbnail;
    
    @Field(type = FieldType.Double)
    private Double rating;
    
    @Field(type = FieldType.Integer)
    private Integer stock;
    
    @Field(type = FieldType.Boolean)
    private Boolean status;
    
    @Field(type = FieldType.Keyword)
    private String spu;
    
    @Field(type = FieldType.Long)
    private Long brandId;
    
    @Field(type = FieldType.Keyword)
    private String brandName;
    
    @Field(type = FieldType.Long)
    private Long categoryId;
    
    @Field(type = FieldType.Keyword)
    private String categoryName;
    
    @Field(type = FieldType.Keyword)
    private String categorySlug;
    
    @Field(type = FieldType.Text)
    private List<String> productImages;
    
    @Field(type = FieldType.Double)
    private Double minPrice;
    
    @Field(type = FieldType.Double)
    private Double maxPrice;
    
    @Field(type = FieldType.Text)
    private List<String> searchableText;
    
    // Product Variants information
    @Field(type = FieldType.Text)
    private List<String> variantSkus;
    
    @Field(type = FieldType.Text)
    private List<String> variantValues;
    
    // Product Attributes information
    @Field(type = FieldType.Text)
    private List<String> attributeNames;
    
    @Field(type = FieldType.Text)
    private List<String> attributeValues;
    
    // Product Filter Values information
    @Field(type = FieldType.Text)
    private List<String> filterValues;
}

