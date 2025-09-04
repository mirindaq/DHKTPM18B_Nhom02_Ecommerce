package iuh.fit.ecommerce.dtos.response.base;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Getter
@Setter
@Builder
public class ResponseWithPagination<T> {
    private T data;
    private int page;
    private int totalPage;
    private int limit;
    private long totalItem;

    public static <E, R> ResponseWithPagination<List<R>> fromPage(Page<E> page,
                                                                  Function<E, R> mapper) {
        return ResponseWithPagination.<List<R>>builder()
                .data(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber() + 1)
                .totalPage(page.getTotalPages())
                .limit(page.getSize())
                .totalItem(page.getTotalElements())
                .build();
    }
}
