package iuh.fit.ecommerce.dtos.response.base;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Builder
public class ResponseError {
    private Date timestamp;
    private Integer status;
    private String error;
    private String path;
    private String message;
}
