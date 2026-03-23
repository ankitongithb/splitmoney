package com.splitmoney.controller;

import com.splitmoney.dto.ApiResponse;
import com.splitmoney.model.User;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;
    private final AuthService authService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/upload/{expenseId}")
    public ResponseEntity<ApiResponse<String>> upload(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long expenseId,
            @RequestParam("file") MultipartFile file) throws Exception {
        String url = receiptService.uploadReceipt(expenseId, file);
        return ResponseEntity.ok(ApiResponse.success("Receipt uploaded", url));
    }

    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> view(@PathVariable String filename) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        String contentType = "application/octet-stream";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
