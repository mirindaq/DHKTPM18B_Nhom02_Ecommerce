package iuh.fit.ecommerce.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import iuh.fit.ecommerce.dtos.request.upload.UploadRequest;
import iuh.fit.ecommerce.services.UploadService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {
    private final Cloudinary cloudinary;

    @Override
    public List<String> upload(UploadRequest uploadRequest) {
        List<MultipartFile> files = uploadRequest.getFiles();
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);

            try {
                Map uploadResult = cloudinary.uploader()
                        .upload(file.getBytes(), ObjectUtils.emptyMap());

                urls.add((String) uploadResult.get("secure_url"));
            } catch (IOException e) {
                throw new RuntimeException("Upload error: " + e.getMessage(), e);
            }
        }
        return urls;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }

        List<String> allowedExtensions = Arrays.asList(".png", ".jpg", ".jpeg", ".gif");
        String fileName = file.getOriginalFilename();

        if (fileName == null) {
            throw new IllegalArgumentException("File name must not be null");
        }

        String lowerCaseFileName = fileName.toLowerCase();
        boolean hasValidExtension = allowedExtensions.stream()
                .anyMatch(lowerCaseFileName::endsWith);

        if (!hasValidExtension) {
            throw new IllegalArgumentException(
                    "File must be PNG, JPG, JPEG, or GIF. Provided: " + fileName
            );
        }
    }


}
