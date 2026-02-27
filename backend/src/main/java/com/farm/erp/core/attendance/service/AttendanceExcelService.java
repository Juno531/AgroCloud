package com.farm.erp.core.attendance.service;

import com.farm.erp.api.v1.dto.AttendanceFilterRequest;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.domain.QAttendanceRecord;
import com.farm.erp.core.attendance.repository.AttendanceRepository;
import com.farm.erp.core.hr.domain.QEmployeeProfile;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class AttendanceExcelService {

    private final AttendanceRepository attendanceRepository;
    private final JPAQueryFactory queryFactory;

    public List<AttendanceRecord> filterAttendance(AttendanceFilterRequest request) {
        QAttendanceRecord attendance = QAttendanceRecord.attendanceRecord;
        QEmployeeProfile employee = QEmployeeProfile.employeeProfile;

        BooleanBuilder builder = new BooleanBuilder();

        if (request.getCompanyCode() != null) {
            builder.and(attendance.companyCode.eq(request.getCompanyCode()));
        }

        if (request.getStartDate() != null && request.getEndDate() != null) {
            builder.and(attendance.timestamp.between(request.getStartDate(), request.getEndDate()));
        }

        if (request.getEmploymentTypes() != null && !request.getEmploymentTypes().isEmpty()) {
            builder.and(queryFactory.selectFrom(employee)
                    .where(employee.user.id.eq(attendance.user.id)
                            .and(employee.employmentType.in(request.getEmploymentTypes())))
                    .exists());
        }

        if (request.getClockInFarmIds() != null && !request.getClockInFarmIds().isEmpty()) {
            builder.and(attendance.farmId.in(request.getClockInFarmIds()));
        }

        if (request.getSearchTerm() != null && !request.getSearchTerm().isEmpty()) {
            builder.and(attendance.user.name.containsIgnoreCase(request.getSearchTerm()));
        }

        if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
            builder.and(attendance.user.id.in(request.getUserIds()));
        }

        Iterable<AttendanceRecord> result = attendanceRepository.findAll(builder, attendance.timestamp.desc());
        List<AttendanceRecord> records = StreamSupport.stream(result.spliterator(), false).collect(Collectors.toList());
        System.out.println(
                "Exporting " + records.size() + " attendance records for company: " + request.getCompanyCode());
        return records;
    }

    public byte[] generateAttendanceExcel(List<AttendanceRecord> records) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            // Group records by user ID to avoid naming collisions with different employees
            // of the same name
            Map<Long, List<AttendanceRecord>> groupedRecords = records.stream()
                    .collect(Collectors.groupingBy(r -> r.getUser().getId()));

            if (groupedRecords.isEmpty()) {
                Sheet sheet = workbook.createSheet("데이터 없음");
                Row row = sheet.createRow(0);
                row.createCell(0).setCellValue("조회된 출퇴근 기록이 없습니다.");
            } else {
                DateTimeFormatter hourMinuteFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
                Set<String> usedSheetNames = new HashSet<>();

                for (Map.Entry<Long, List<AttendanceRecord>> entry : groupedRecords.entrySet()) {
                    List<AttendanceRecord> userLogs = entry.getValue();
                    if (userLogs.isEmpty())
                        continue;

                    String userName = userLogs.get(0).getUser().getName();
                    Long userId = entry.getKey();

                    // Sheet name must be unique and up to 31 chars
                    // Including ID to prevent duplicate sheet names for same-named users
                    String safeSheetName = generateSafeSheetName(userName, userId, usedSheetNames);
                    Sheet sheet = workbook.createSheet(safeSheetName);

                    // Header
                    Row headerRow = sheet.createRow(0);
                    headerRow.createCell(0).setCellValue("이름");
                    headerRow.createCell(1).setCellValue("근무일");
                    headerRow.createCell(2).setCellValue("주차");
                    headerRow.createCell(3).setCellValue("일수");
                    headerRow.createCell(4).setCellValue("출근시간");
                    headerRow.createCell(5).setCellValue("퇴근시간");

                    // Styling
                    CellStyle headerStyle = workbook.createCellStyle();
                    Font headerFont = workbook.createFont();
                    headerFont.setBold(true);
                    headerStyle.setFont(headerFont);
                    for (int i = 0; i < 6; i++) {
                        headerRow.getCell(i).setCellStyle(headerStyle);
                    }

                    // Pairing CLOCK_IN and CLOCK_OUT
                    int rowIdx = 1;

                    // Sort by timestamp asc for pairing
                    userLogs.sort(Comparator.comparing(AttendanceRecord::getTimestamp));

                    AttendanceRecord lastIn = null;

                    for (AttendanceRecord record : userLogs) {
                        if (record.getType() == AttendanceRecord.AttendanceType.CLOCK_IN) {
                            if (lastIn != null) {
                                // Previous CLOCK_IN had no CLOCK_OUT, write it anyway
                                Row row = sheet.createRow(rowIdx++);
                                row.createCell(0).setCellValue(userName);
                                row.createCell(1).setCellValue(lastIn.getTimestamp().toLocalDate().toString());
                                row.createCell(2).setCellValue("-");
                                row.createCell(3).setCellValue("-");
                                row.createCell(4).setCellValue(lastIn.getTimestamp().format(hourMinuteFormatter));
                                row.createCell(5).setCellValue("-");
                            }
                            lastIn = record;
                        } else if (record.getType() == AttendanceRecord.AttendanceType.CLOCK_OUT) {
                            if (lastIn != null) {

                                Row row = sheet.createRow(rowIdx++);
                                LocalDate date = lastIn.getTimestamp().toLocalDate();

                                row.createCell(0).setCellValue(userName);
                                row.createCell(1).setCellValue(date.toString());
                                row.createCell(2).setCellValue(record.getWeekNumber());
                                row.createCell(3).setCellValue(record.getWorkingDayIndex());
                                row.createCell(4).setCellValue(lastIn.getTimestamp().format(hourMinuteFormatter));
                                row.createCell(5).setCellValue(record.getTimestamp().format(hourMinuteFormatter));
                                lastIn = null;
                            } else {
                                // CLOCK_OUT without CLOCK_IN
                                Row row = sheet.createRow(rowIdx++);
                                row.createCell(0).setCellValue(userName);
                                row.createCell(1).setCellValue(record.getTimestamp().toLocalDate().toString());
                                row.createCell(2).setCellValue("-");
                                row.createCell(3).setCellValue("-");
                                row.createCell(4).setCellValue("-");
                                row.createCell(5).setCellValue(record.getTimestamp().format(hourMinuteFormatter));
                            }
                        }
                    }

                    // Final check for trailing CLOCK_IN
                    if (lastIn != null) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(userName);
                        row.createCell(1).setCellValue(lastIn.getTimestamp().toLocalDate().toString());
                        row.createCell(2).setCellValue("-");
                        row.createCell(3).setCellValue("-");
                        row.createCell(4).setCellValue(lastIn.getTimestamp().format(hourMinuteFormatter));
                        row.createCell(5).setCellValue("-");
                    }

                    for (int i = 0; i < 6; i++) {
                        sheet.autoSizeColumn(i);
                    }
                }
            }

            workbook.write(out);
        }
        return out.toByteArray();
    }

    private String generateSafeSheetName(String userName, Long userId, Set<String> usedSheetNames) {
        // Sheet name must be unique and up to 31 chars
        String rawSheetName = userName + "(" + userId + ")";
        String safeSheetName = rawSheetName.replaceAll("[/\\\\?*\\[\\]:]", "_");

        if (safeSheetName.length() > 31) {
            safeSheetName = safeSheetName.substring(0, 31);
        }

        // Ensure uniqueness
        if (!usedSheetNames.contains(safeSheetName)) {
            usedSheetNames.add(safeSheetName);
            return safeSheetName;
        }

        // If still duplicate (unlikely with ID, but just in case of truncation)
        int counter = 1;
        String baseName = safeSheetName.length() > 28 ? safeSheetName.substring(0, 28) : safeSheetName;
        while (usedSheetNames.contains(baseName + "_" + counter)) {
            counter++;
        }
        String finalName = baseName + "_" + counter;
        usedSheetNames.add(finalName);
        return finalName;
    }
}
