import sys

content = """package com.farm.erp.core.attendance.service;

import com.farm.erp.api.v1.dto.AttendanceFilterRequest;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.domain.LeaveRecord;
import com.farm.erp.core.attendance.domain.QAttendanceRecord;
import com.farm.erp.core.attendance.repository.AttendanceRepository;
import com.farm.erp.core.attendance.repository.LeaveRepository;
import com.farm.erp.core.hr.domain.EmployeeProfile;
import com.farm.erp.core.hr.domain.QEmployeeProfile;
import com.farm.erp.core.hr.repository.EmployeeProfileRepository;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class AttendanceExcelService {

    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final JPAQueryFactory queryFactory;
    private final EmployeeProfileRepository employeeProfileRepository;

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
        System.out.println("Exporting " + records.size() + " attendance records for company: " + request.getCompanyCode());
        return records;
    }

    public byte[] generateAttendanceExcel(List<AttendanceRecord> records, AttendanceFilterRequest request) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Map<Long, List<AttendanceRecord>> groupedRecords = records.stream()
                    .collect(Collectors.groupingBy(r -> r.getUser().getId()));

            List<LeaveRecord> allLeaves = new ArrayList<>();
            if (Boolean.TRUE.equals(request.getIncludeLeaves()) && request.getStartDate() != null && request.getEndDate() != null) {
                if (request.getCompanyCode() != null) {
                    allLeaves = leaveRepository.findByCompanyCodeAndDateBetween(request.getCompanyCode(), request.getStartDate().toLocalDate(), request.getEndDate().toLocalDate());
                }
                if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
                    List<Long> uids = request.getUserIds();
                    allLeaves = allLeaves.stream().filter(l -> uids.contains(l.getUser().getId())).collect(Collectors.toList());
                }
            }
            Map<Long, List<LeaveRecord>> groupedLeaves = allLeaves.stream()
                    .collect(Collectors.groupingBy(l -> l.getUser().getId()));

            Set<Long> allUserIds = new HashSet<>(groupedRecords.keySet());
            allUserIds.addAll(groupedLeaves.keySet());

            if (allUserIds.isEmpty()) {
                Sheet sheet = workbook.createSheet("데이터 없음");
                Row row = sheet.createRow(0);
                row.createCell(0).setCellValue("조회된 출퇴근/휴무 기록이 없습니다.");
                workbook.write(out);
                return out.toByteArray();
            }

            List<Long> userIds = new ArrayList<>(allUserIds);
            Map<Long, EmployeeProfile> profileMap = new HashMap<>();

            for (Long uid : userIds) {
                employeeProfileRepository.findByUserId(uid).ifPresent(p -> profileMap.put(uid, p));
            }

            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            Set<String> usedSheetNames = new HashSet<>();

            List<String> exportFields = request.getExportFields();
            if (exportFields == null || exportFields.isEmpty()) {
                exportFields = Arrays.asList("name", "reason", "remarks", "week", "days", "clockIn", "clockOut", "workingHours", "hourlyWage", "totalPay");
            }

            for (Long userId : userIds) {
                List<AttendanceRecord> userLogs = groupedRecords.getOrDefault(userId, new ArrayList<>());
                List<LeaveRecord> userLeaves = groupedLeaves.getOrDefault(userId, new ArrayList<>());
                
                if (userLogs.isEmpty() && userLeaves.isEmpty()) {
                    continue;
                }

                String userName = !userLogs.isEmpty() ? userLogs.get(0).getUser().getName() : userLeaves.get(0).getUser().getName();
                EmployeeProfile profile = profileMap.get(userId);
                BigDecimal hourlyWage = profile != null && profile.getHourlyWage() != null ? profile.getHourlyWage() : BigDecimal.ZERO;

                String safeSheetName = generateSafeSheetName(userName, userId, usedSheetNames);
                Sheet sheet = workbook.createSheet(safeSheetName);

                Row headerRow = sheet.createRow(0);
                int colIdx = 0;
                for (String field : exportFields) {
                    headerRow.createCell(colIdx++).setCellValue(getHeaderName(field));
                }

                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);
                for (int i = 0; i < colIdx; i++) {
                    headerRow.getCell(i).setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                userLogs.sort(Comparator.comparing(AttendanceRecord::getTimestamp));
                userLeaves.sort(Comparator.comparing(LeaveRecord::getLeaveDate));

                // Process attendance records into unified rows
                List<ExportRowData> combinedRows = new ArrayList<>();
                
                AttendanceRecord lastIn = null;
                for (AttendanceRecord record : userLogs) {
                    if (record.getType() == AttendanceRecord.AttendanceType.CLOCK_IN) {
                        if (lastIn != null) {
                            combinedRows.add(new ExportRowData(lastIn.getTimestamp(), lastIn, null, null));
                        }
                        lastIn = record;
                    } else if (record.getType() == AttendanceRecord.AttendanceType.CLOCK_OUT) {
                        if (lastIn != null) {
                            combinedRows.add(new ExportRowData(lastIn.getTimestamp(), lastIn, record, null));
                            lastIn = null;
                        } else {
                            combinedRows.add(new ExportRowData(record.getTimestamp(), null, record, null));
                        }
                    }
                }
                if (lastIn != null) {
                    combinedRows.add(new ExportRowData(lastIn.getTimestamp(), lastIn, null, null));
                }

                // Add leave records
                for (LeaveRecord leave : userLeaves) {
                    combinedRows.add(new ExportRowData(leave.getLeaveDate().atStartOfDay(), null, null, leave));
                }

                // Sort combined rows chronologically
                combinedRows.sort(Comparator.comparing(ExportRowData::getTimestamp));

                for (ExportRowData rowData : combinedRows) {
                    writeUnifiedRow(sheet, rowIdx++, exportFields, userName, rowData, hourlyWage, dateTimeFormatter, dateFormatter);
                }

                for (int i = 0; i < colIdx; i++) {
                    sheet.autoSizeColumn(i);
                }
            }
            workbook.write(out);
        }
        return out.toByteArray();
    }

    private static class ExportRowData {
        LocalDateTime timestamp;
        AttendanceRecord clockIn;
        AttendanceRecord clockOut;
        LeaveRecord leave;

        public ExportRowData(LocalDateTime timestamp, AttendanceRecord clockIn, AttendanceRecord clockOut, LeaveRecord leave) {
            this.timestamp = timestamp;
            this.clockIn = clockIn;
            this.clockOut = clockOut;
            this.leave = leave;
        }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    private String getHeaderName(String field) {
        switch (field) {
            case "name": return "이름";
            case "reason": return "사유";
            case "remarks": return "비고";
            case "week": return "주차";
            case "days": return "일수";
            case "clockIn": return "출근시간/휴무일";
            case "clockOut": return "퇴근시간";
            case "workingHours": return "근무시간";
            case "hourlyWage": return "시급";
            case "totalPay": return "총시급";
            default: return field;
        }
    }

    private void writeUnifiedRow(Sheet sheet, int rowIdx, List<String> exportFields, String userName, ExportRowData rowData, BigDecimal hourlyWage, DateTimeFormatter dateTimeFormatter, DateTimeFormatter dateFormatter) {
        Row row = sheet.createRow(rowIdx);
        int colIdx = 0;

        AttendanceRecord clockIn = rowData.clockIn;
        AttendanceRecord clockOut = rowData.clockOut;
        LeaveRecord leave = rowData.leave;

        String reason = "-";
        String remarks = "-";
        
        if (leave != null) {
            reason = leave.getReason() != null ? leave.getReason() : "휴무";
            remarks = "-";
        } else {
            AttendanceRecord baseRecord = clockOut != null ? clockOut : clockIn;
            if (baseRecord != null) {
                reason = baseRecord.getReason() != null ? baseRecord.getReason() : (clockIn != null && clockIn.getReason() != null ? clockIn.getReason() : "-");
                remarks = baseRecord.getRemarks() != null ? baseRecord.getRemarks() : (clockIn != null && clockIn.getRemarks() != null ? clockIn.getRemarks() : "-");
            }
        }

        BigDecimal workingHours = BigDecimal.ZERO;
        String workingHoursStr = "-";
        if (clockIn != null && clockOut != null) {
            Duration duration = Duration.between(clockIn.getTimestamp(), clockOut.getTimestamp());
            long minutes = duration.toMinutes();
            workingHours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            long hours = minutes / 60;
            long mins = minutes % 60;
            workingHoursStr = String.format("%02d:%02d", hours, mins);
        } else if (leave != null) {
            workingHoursStr = "00:00";
        }

        BigDecimal totalPay = workingHours.multiply(hourlyWage).setScale(0, RoundingMode.HALF_UP);

        for (String field : exportFields) {
            Cell cell = row.createCell(colIdx++);
            switch (field) {
                case "name":
                    cell.setCellValue(userName);
                    break;
                case "reason":
                    cell.setCellValue(reason);
                    break;
                case "remarks":
                    cell.setCellValue(remarks);
                    break;
                case "week":
                    if (leave != null) {
                        cell.setCellValue("-");
                    } else {
                        cell.setCellValue(clockOut != null && clockOut.getWeekNumber() != null ? String.valueOf(clockOut.getWeekNumber()) : "-");
                    }
                    break;
                case "days":
                    if (leave != null) {
                        cell.setCellValue("-");
                    } else {
                        cell.setCellValue(clockOut != null && clockOut.getWorkingDayIndex() != null ? String.valueOf(clockOut.getWorkingDayIndex()) : "-");
                    }
                    break;
                case "clockIn":
                    if (leave != null) {
                        cell.setCellValue(leave.getLeaveDate().format(dateFormatter) + " (휴무)");
                    } else {
                        cell.setCellValue(clockIn != null ? clockIn.getTimestamp().format(dateTimeFormatter) : "-");
                    }
                    break;
                case "clockOut":
                    if (leave != null) {
                        cell.setCellValue("-");
                    } else {
                        cell.setCellValue(clockOut != null ? clockOut.getTimestamp().format(dateTimeFormatter) : "-");
                    }
                    break;
                case "workingHours":
                    cell.setCellValue(workingHoursStr);
                    break;
                case "hourlyWage":
                    cell.setCellValue(hourlyWage.compareTo(BigDecimal.ZERO) > 0 ? String.format("%,d", hourlyWage.longValue()) : "-");
                    break;
                case "totalPay":
                    cell.setCellValue(totalPay.compareTo(BigDecimal.ZERO) > 0 ? String.format("%,d", totalPay.longValue()) : "-");
                    break;
            }
        }
    }

    private String generateSafeSheetName(String userName, Long userId, Set<String> usedSheetNames) {
        String rawSheetName = userName + "(" + userId + ")";
        String safeSheetName = rawSheetName.replaceAll("[/\\\\?*\\[\\]:]", "_");
        if (safeSheetName.length() > 31) safeSheetName = safeSheetName.substring(0, 31);
        if (!usedSheetNames.contains(safeSheetName)) {
            usedSheetNames.add(safeSheetName);
            return safeSheetName;
        }
        int counter = 1;
        String baseName = safeSheetName.length() > 28 ? safeSheetName.substring(0, 28) : safeSheetName;
        while (usedSheetNames.contains(baseName + "_" + counter)) counter++;
        String finalName = baseName + "_" + counter;
        usedSheetNames.add(finalName);
        return finalName;
    }
}
"""

with open("backend/src/main/java/com/farm/erp/core/attendance/service/AttendanceExcelService.java", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated AttendanceExcelService.java successfully.")
