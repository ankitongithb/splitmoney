package com.splitmoney.controller;

import com.splitmoney.model.User;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final AuthService authService;

    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @AuthenticationPrincipal UserDetails details,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) throws Exception {
        User user = authService.getCurrentUser(details.getUsername());
        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();

        byte[] data = reportService.generateExcel(user, month, year);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses_" + month + "_" + year + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal UserDetails details,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) throws Exception {
        User user = authService.getCurrentUser(details.getUsername());
        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();

        byte[] data = reportService.generatePdf(user, month, year);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses_" + month + "_" + year + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
