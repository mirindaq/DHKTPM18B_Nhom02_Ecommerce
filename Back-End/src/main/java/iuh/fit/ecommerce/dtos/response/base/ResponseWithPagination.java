package iuh.fit.ecommerce.dtos.response.base;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ResponseWithPagination<T> {
    private T data;
    private int page;
    private int totalPage;
    private int limit;
    private int totalItem;
}
