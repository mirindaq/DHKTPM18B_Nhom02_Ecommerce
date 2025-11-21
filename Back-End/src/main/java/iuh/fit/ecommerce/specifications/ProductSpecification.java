package iuh.fit.ecommerce.specifications;

import iuh.fit.ecommerce.entities.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            String categorySlug,
            List<String> brandSlugs,
            Boolean inStock,
            Double priceMin,
            Double priceMax,
            List<Long> filterValueIds,
            String sortBy
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categorySlug != null && !categorySlug.isEmpty()) {
                Join<Product, Category> categoryJoin = root.join("category", JoinType.INNER);
                predicates.add(cb.equal(categoryJoin.get("slug"), categorySlug));
            }

            if (brandSlugs != null && !brandSlugs.isEmpty()) {
                Join<Product, Brand> brandJoin = root.join("brand", JoinType.INNER);
                predicates.add(brandJoin.get("slug").in(brandSlugs));
            }

            if (inStock != null && inStock) {
                // Check if total stock of all variants > 0
                assert query != null;
                Subquery<Long> stockSubquery = query.subquery(Long.class);
                Root<ProductVariant> variantRootStock = stockSubquery.from(ProductVariant.class);
                stockSubquery.select(cb.sum(variantRootStock.get("stock")));
                stockSubquery.where(cb.equal(variantRootStock.get("product"), root));
                predicates.add(cb.greaterThan(stockSubquery, 0L));
            }

            if (priceMin != null || priceMax != null) {
                assert query != null;
                Subquery<Double> priceSubquery = query.subquery(Double.class);
                Root<ProductVariant> variantRoot = priceSubquery.from(ProductVariant.class);
                priceSubquery.select(cb.min(variantRoot.get("price")));
                priceSubquery.where(cb.equal(variantRoot.get("product"), root));

                if (priceMin != null && priceMax != null) {
                    predicates.add(cb.between(priceSubquery, priceMin, priceMax));
                } else if (priceMin != null) {
                    predicates.add(cb.greaterThanOrEqualTo(priceSubquery, priceMin));
                } else {
                    predicates.add(cb.lessThanOrEqualTo(priceSubquery, priceMax));
                }
            }

            if (filterValueIds != null && !filterValueIds.isEmpty()) {
                assert query != null;
                Subquery<Long> filterSubquery = query.subquery(Long.class);
                Root<Product> subRoot = filterSubquery.from(Product.class);
                Join<Product, ProductFilterValue> pfvJoin = subRoot.join("productFilterValues", JoinType.INNER);
                Join<ProductFilterValue, FilterValue> fvJoin = pfvJoin.join("filterValue", JoinType.INNER);

                filterSubquery.select(subRoot.get("id"));
                filterSubquery.where(
                        cb.and(
                                cb.equal(subRoot.get("id"), root.get("id")),
                                fvJoin.get("id").in(filterValueIds)
                        )
                );

                predicates.add(cb.exists(filterSubquery));
            }

            assert query != null;
            query.distinct(true);
            
            // Add sorting based on sortBy parameter
            if (sortBy != null && !sortBy.isEmpty()) {
                switch (sortBy) {
                    case "price_asc":
                        // Sort by minimum price ascending
                        Subquery<Double> minPriceAsc = query.subquery(Double.class);
                        Root<ProductVariant> variantRootAsc = minPriceAsc.from(ProductVariant.class);
                        minPriceAsc.select(cb.min(variantRootAsc.get("price")));
                        minPriceAsc.where(cb.equal(variantRootAsc.get("product"), root));
                        query.orderBy(cb.asc(minPriceAsc));
                        break;
                    case "price_desc":
                        // Sort by minimum price descending
                        Subquery<Double> minPriceDesc = query.subquery(Double.class);
                        Root<ProductVariant> variantRootDesc = minPriceDesc.from(ProductVariant.class);
                        minPriceDesc.select(cb.min(variantRootDesc.get("price")));
                        minPriceDesc.where(cb.equal(variantRootDesc.get("product"), root));
                        query.orderBy(cb.desc(minPriceDesc));
                        break;
                    default:
                        // Default: sort by id descending (newest first)
                        query.orderBy(cb.desc(root.get("id")));
                        break;
                }
            } else {
                // Default: sort by id descending
                query.orderBy(cb.desc(root.get("id")));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

