package com.farm.erp.core.harvest.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QHarvestRecord is a Querydsl query type for HarvestRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QHarvestRecord extends EntityPathBase<HarvestRecord> {

    private static final long serialVersionUID = -947351634L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QHarvestRecord harvestRecord = new QHarvestRecord("harvestRecord");

    public final com.farm.erp.core.production.domain.QBed bed;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.farm.erp.core.production.domain.QCrop crop;

    public final ListPath<HarvestDetail, QHarvestDetail> details = this.<HarvestDetail, QHarvestDetail>createList("details", HarvestDetail.class, QHarvestDetail.class, PathInits.DIRECT2);

    public final DatePath<java.time.LocalDate> harvestDate = createDate("harvestDate", java.time.LocalDate.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath note = createString("note");

    public final com.farm.erp.core.production.domain.QSeason season;

    public final StringPath workerName = createString("workerName");

    public QHarvestRecord(String variable) {
        this(HarvestRecord.class, forVariable(variable), INITS);
    }

    public QHarvestRecord(Path<? extends HarvestRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QHarvestRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QHarvestRecord(PathMetadata metadata, PathInits inits) {
        this(HarvestRecord.class, metadata, inits);
    }

    public QHarvestRecord(Class<? extends HarvestRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.bed = inits.isInitialized("bed") ? new com.farm.erp.core.production.domain.QBed(forProperty("bed"), inits.get("bed")) : null;
        this.crop = inits.isInitialized("crop") ? new com.farm.erp.core.production.domain.QCrop(forProperty("crop")) : null;
        this.season = inits.isInitialized("season") ? new com.farm.erp.core.production.domain.QSeason(forProperty("season"), inits.get("season")) : null;
    }

}

