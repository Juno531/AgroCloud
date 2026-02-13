package com.farm.erp.core.harvest.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.harvest.domain.HarvestDetail;
import com.farm.erp.core.harvest.domain.HarvestRecord;
import com.farm.erp.core.harvest.dto.HarvestRecordRequest;
import com.farm.erp.core.harvest.dto.HarvestRecordResponse;
import com.farm.erp.core.harvest.repository.HarvestRecordRepository;
import com.farm.erp.core.production.domain.Bed;
import com.farm.erp.core.production.domain.Crop;
import com.farm.erp.core.production.domain.Season;
import com.farm.erp.core.production.repository.BedRepository;
import com.farm.erp.core.production.repository.CropRepository;
import com.farm.erp.core.production.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HarvestService {

    private final HarvestRecordRepository harvestRecordRepository;
    private final SeasonRepository seasonRepository;
    private final BedRepository bedRepository;
    private final CropRepository cropRepository;

    @Transactional
    public HarvestRecordResponse createHarvestRecord(HarvestRecordRequest request) {
        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Season not found"));
        
        Bed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Bed not found"));
        
        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CROP_NOT_FOUND));

        HarvestRecord record = HarvestRecord.builder()
                .season(season)
                .bed(bed)
                .crop(crop)
                .harvestDate(request.getHarvestDate())
                .workerName(request.getWorkerName())
                .note(request.getNote())
                .build();

        request.getDetails().forEach(detailDto -> {
            HarvestDetail detail = HarvestDetail.builder()
                    .grade(detailDto.getGrade())
                    .weightKg(detailDto.getWeightKg())
                    .boxCount(detailDto.getBoxCount())
                    .build();
            record.addDetail(detail);
        });

        return HarvestRecordResponse.from(harvestRecordRepository.save(record));
    }

    public List<HarvestRecordResponse> getHarvestRecordsBySeason(Long seasonId) {
        return harvestRecordRepository.findBySeasonIdWithDetails(seasonId).stream()
                .map(HarvestRecordResponse::from)
                .collect(Collectors.toList());
    }
}
