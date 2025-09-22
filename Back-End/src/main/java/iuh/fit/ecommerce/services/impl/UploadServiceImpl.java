package iuh.fit.ecommerce.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import iuh.fit.ecommerce.dtos.request.upload.UploadRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import iuh.fit.ecommerce.services.UploadService;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {
    private final Cloudinary cloudinary;
    @Value("${app.upload-dir}")
    private String uploadFolder;

    @Override
    public List<String> upload(UploadRequest uploadRequest) {
        List<MultipartFile> files = uploadRequest.getFiles();
        List<String> savedFileUrls = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return savedFileUrls;
        }

        // Validate danh sách file
        validateFile(files);

        // Tạo thư mục upload nếu chưa có
        Path uploadDir = Paths.get(uploadFolder).toAbsolutePath().normalize();
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload: " + e.getMessage(), e);
        }

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .toUriString();

        // Số thread tối đa 6
        int poolSize = Math.max(1, Math.min(files.size(), 6));
        ExecutorService executorService = Executors.newFixedThreadPool(poolSize);
        List<Future<String>> futures = new ArrayList<>();

        for (MultipartFile file : files) {
            Future<String> future = executorService.submit(() -> {
                try {
                    String originalFileName = Paths.get(file.getOriginalFilename()).getFileName().toString();
                    String fileExtension = getFileExtension(originalFileName);
                    String baseName = originalFileName.replace(fileExtension, "");

                    // Sinh tên mới tránh trùng
                    String newFileName = baseName + "_" + UUID.randomUUID() + fileExtension;

                    Path uploadPath = uploadDir.resolve(newFileName);

                    // Lưu file vào local
                    Files.copy(file.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);

                    // Tạo URL HTTP public (dựa trên baseUrl đã lấy trước)
                    String publicUrl = baseUrl + newFileName;

                    return publicUrl;
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi khi upload file: " + e.getMessage(), e);
                }
            });
            futures.add(future);
        }

        // Lấy kết quả từ futures
        for (Future<String> future : futures) {
            try {
                savedFileUrls.add(future.get());
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException("Lỗi khi xử lý upload: " + e.getMessage(), e);
            }
        }

        executorService.shutdown();

        return savedFileUrls;
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex);
    }

    private void validateFile(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Danh sách file không được null hoặc rỗng");
        }

        List<String> allowedExtensions = Arrays.asList(".png", ".jpg", ".jpeg", ".gif");

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File không được null hoặc rỗng");
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.trim().isEmpty()) {
                throw new IllegalArgumentException("Tên file không được null hoặc rỗng");
            }

            String lowerCaseFileName = fileName.toLowerCase();
            boolean hasValidExtension = allowedExtensions.stream()
                    .anyMatch(lowerCaseFileName::endsWith);

            if (!hasValidExtension) {
                throw new IllegalArgumentException(
                        "File phải có định dạng PNG, JPG, JPEG hoặc GIF. File vi phạm: " + fileName
                );
            }
        }
    }



}
