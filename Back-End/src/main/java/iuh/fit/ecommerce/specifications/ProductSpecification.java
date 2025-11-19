package iuh.fit.ecommerce.specifications;

import iuh.fit.ecommerce.entities.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            String categorySlug,
            List<String> brandSlugs,
            Boolean inStock,
            Double priceMin,
            Double priceMax,
            Map<String, List<String>> variantFilters
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
                predicates.add(cb.greaterThan(root.get("stock"), 0));
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

            if (variantFilters != null && !variantFilters.isEmpty()) {
                for (Map.Entry<String, List<String>> entry : variantFilters.entrySet()) {
                    String variantSlug = entry.getKey();
                    List<String> valuesSlugs = entry.getValue();

                    if (valuesSlugs == null || valuesSlugs.isEmpty()) continue;

                    assert query != null;
                    Subquery<Long> variantSubquery = query.subquery(Long.class);
                    Root<Product> subRoot = variantSubquery.from(Product.class);
                    Join<Product, ProductVariant> pvJoin = subRoot.join("productVariants", JoinType.INNER);
                    Join<ProductVariant, ProductVariantValue> pvvJoin = pvJoin.join("productVariantValues", JoinType.INNER);
                    Join<ProductVariantValue, VariantValue> vvJoin = pvvJoin.join("variantValue", JoinType.INNER);
                    Join<VariantValue, Variant> vJoin = vvJoin.join("variant", JoinType.INNER);

                    variantSubquery.select(subRoot.get("id"));
                    variantSubquery.where(
                            cb.and(
                                    cb.equal(subRoot.get("id"), root.get("id")),
                                    cb.equal(vJoin.get("slug"), variantSlug),
                                    vvJoin.get("slug").in(valuesSlugs)
                            )
                    );

                    predicates.add(cb.exists(variantSubquery));
                }
            }

            assert query != null;
            query.  distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

