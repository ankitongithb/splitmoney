package com.splitmoney.service;

import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.model.Expense;
import com.splitmoney.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ExpenseRepository expenseRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String uploadReceipt(Long expenseId, MultipartFile file) throws IOException {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + expenseId));

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/api/receipts/view/" + filename;
        expense.setReceiptUrl(fileUrl);
        expenseRepository.save(expense);

        return fileUrl;
    }
}
