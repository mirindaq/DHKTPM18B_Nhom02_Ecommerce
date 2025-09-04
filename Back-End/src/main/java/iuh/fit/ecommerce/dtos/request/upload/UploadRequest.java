package iuh.fit.ecommerce.dtos.request.upload;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class UploadRequest {
    private List<MultipartFile> files;
}
