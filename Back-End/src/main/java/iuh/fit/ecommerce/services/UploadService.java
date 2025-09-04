package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.upload.UploadRequest;

import java.util.List;


public interface UploadService {
    List<String> upload(UploadRequest uploadRequest);
}
