package com.splitmoney.service;

// ─── Apache POI (Excel) imports ─────────────────────────────────────────────
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

// ─── NO iText imports (fully-qualified usage) ───────────────────────────────

import com.splitmoney.model.Expense;
import com.splitmoney.model.User;
import com.splitmoney.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ExpenseRepository expenseRepository;

    // ───────────────────────── EXCEL REPORT ─────────────────────────
    public byte[] generateExcel(User user, int month, int year) {
        try {
            List<Expense> expenses = expenseRepository.findByUserAndMonthYear(user, month, year);

            Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            Sheet sheet = workbook.createSheet("Expenses");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Alternate Row Style
            CellStyle altStyle = workbook.createCellStyle();
            altStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            String[] headers = {"#", "Date", "Title", "Category",
                    "Amount", "Currency", "INR Amount", "Description"};

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (Expense e : expenses) {
                Row row = sheet.createRow(rowNum);
                CellStyle style = (rowNum % 2 == 0) ? altStyle : null;

                setCell(row, 0, String.valueOf(rowNum), style);
                setCell(row, 1, e.getExpenseDate().toString(), style);
                setCell(row, 2, e.getTitle(), style);
                setCell(row, 3, e.getCategory(), style);
                setCell(row, 4, e.getAmount().toPlainString(), style);
                setCell(row, 5, e.getCurrency(), style);
                setCell(row, 6, e.getAmountInr().toPlainString(), style);
                setCell(row, 7, e.getDescription() != null ? e.getDescription() : "", style);

                rowNum++;
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            workbook.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(col);
        cell.setCellValue(value);
        if (style != null) cell.setCellStyle(style);
    }

    // ───────────────────────── PDF REPORT ─────────────────────────
    public byte[] generatePdf(User user, int month, int year) {
        try {
            List<Expense> expenses = expenseRepository.findByUserAndMonthYear(user, month, year);

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            com.lowagie.text.Document doc =
                    new com.lowagie.text.Document(com.lowagie.text.PageSize.A4.rotate());

            com.lowagie.text.pdf.PdfWriter.getInstance(doc, out);
            doc.open();

            // Fonts
            com.lowagie.text.Font titleFont =
                    com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA_BOLD, 16,
                            new Color(99, 102, 241));

            com.lowagie.text.Font hdrFont =
                    com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA_BOLD, 10,
                            Color.WHITE);

            com.lowagie.text.Font bodyFont =
                    com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA, 10,
                            Color.BLACK);

            // Title
            doc.add(new com.lowagie.text.Paragraph("SplitMoney — Expense Report", titleFont));
            doc.add(new com.lowagie.text.Paragraph(
                    "User: " + user.getName() + " | Period: " + month + "/" + year,
                    bodyFont));

            doc.add(com.lowagie.text.Chunk.NEWLINE);

            // Table
            com.lowagie.text.Table table;
            try {
                table = new com.lowagie.text.Table(7);
            } catch (com.lowagie.text.BadElementException e) {
                throw new RuntimeException("Error creating table", e);
            }

            table.setWidth(100f);
            table.setPadding(5f);

            String[] cols = {"#", "Date", "Title", "Category", "Amount", "CCY", "INR"};

            for (String c : cols) {
                addPdfCell(table, c, hdrFont, new Color(99, 102, 241));
            }

            int index = 1;
            for (Expense e : expenses) {
                Color bg = (index % 2 == 0) ? new Color(240, 244, 255) : Color.WHITE;

                addPdfCell(table, String.valueOf(index++), bodyFont, bg);
                addPdfCell(table, e.getExpenseDate().toString(), bodyFont, bg);
                addPdfCell(table, e.getTitle(), bodyFont, bg);
                addPdfCell(table, e.getCategory(), bodyFont, bg);
                addPdfCell(table, e.getAmount().toPlainString(), bodyFont, bg);
                addPdfCell(table, e.getCurrency(), bodyFont, bg);
                addPdfCell(table, e.getAmountInr().toPlainString(), bodyFont, bg);
            }

            doc.add(table);

            doc.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }

    private void addPdfCell(com.lowagie.text.Table table,
                            String text,
                            com.lowagie.text.Font font,
                            Color bg) {
        try {
            com.lowagie.text.Cell cell =
                    new com.lowagie.text.Cell(
                            new com.lowagie.text.Phrase(text, font));

            cell.setBackgroundColor(bg);
            cell.setBorderWidth(0.3f);

            table.addCell(cell);

        } catch (com.lowagie.text.BadElementException e) {
            throw new RuntimeException("Error adding PDF cell", e);
        }
    }
}