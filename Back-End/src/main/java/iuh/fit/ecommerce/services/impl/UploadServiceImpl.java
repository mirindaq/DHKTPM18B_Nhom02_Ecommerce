package iuh.fit.ecommerce.services.impl;

import io.minio.*;
import iuh.fit.ecommerce.dtos.request.upload.UploadRequest;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import iuh.fit.ecommerce.services.UploadService;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadServiceImpl implements UploadService {
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.url}")
    private String minioUrl;

    @Override
    public List<String> upload(UploadRequest uploadRequest) {
        List<MultipartFile> files = uploadRequest.getFiles();
        List<String> savedFileUrls = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return savedFileUrls;
        }
        validateFile(files);

        int poolSize = Math.max(1, Math.min(files.size(), 6));
        ExecutorService executorService = Executors.newFixedThreadPool(poolSize);
        List<Future<String>> futures = new ArrayList<>();

        for (MultipartFile file : files) {
            Future<String> future = executorService.submit(() -> {
                try {
                    String originalFileName = file.getOriginalFilename();
                    String fileExtension = getFileExtension(originalFileName);
                    String baseName = originalFileName.replace(fileExtension, "");

                    String objectName = baseName + "_" + UUID.randomUUID() + fileExtension;

                    try (InputStream inputStream = file.getInputStream()) {
                        minioClient.putObject(
                                PutObjectArgs.builder()
                                        .bucket(bucketName)
                                        .object(objectName)
                                        .stream(inputStream, file.getSize(), -1)
                                        .contentType(file.getContentType())
                                        .build()
                        );
                    }

                    return String.format("%s/%s/%s", minioUrl, bucketName, objectName);
                } catch (Exception e) {
                    log.error("Lỗi khi upload file: {}", e.getMessage());
                    throw new RuntimeException("Lỗi khi upload file: " + e.getMessage(), e);
                }
            });
            futures.add(future);
        }

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

    @Override
    public void deleteFile(String url) {
        try {
            String objectName = extractObjectName(url);

            try {
                minioClient.statObject(
                        StatObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .build()
                );
            } catch (Exception e) {
                throw new ResourceNotFoundException("File không tồn tại: " + objectName);
            }

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("Đã xóa file: {}", objectName);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi xóa file: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi xóa file: " + e.getMessage(), e);
        }
    }

    private String extractObjectName(String fileNameOrUrl) {
        if (fileNameOrUrl == null || fileNameOrUrl.trim().isEmpty()) {
            throw new InvalidParamException("Tên file không được để trống");
        }

        if (fileNameOrUrl.startsWith("http://") || fileNameOrUrl.startsWith("https://")) {
            String bucketPath = "/" + bucketName + "/";
            int index = fileNameOrUrl.indexOf(bucketPath);
            if (index != -1) {
                return fileNameOrUrl.substring(index + bucketPath.length());
            }
        }

        return fileNameOrUrl;
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex);
    }

    private void validateFile(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Danh sách file không được null hoặc rỗng");
        }

        List<String> allowedExtensions = Arrays.asList(".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif");

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
                        "File phải có định dạng PNG, JPG, JPEG, .WEBP, .AVIF hoặc GIF. File vi phạm: " + fileName
                );
            }
        }
    }
}
