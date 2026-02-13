package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPestRecord is a Querydsl query type for PestRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPestRecord extends EntityPathBase<PestRecord> {

    private static final long serialVersionUID = -903600747L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPestRecord pestRecord = new QPestRecord("pestRecord");

    public final NumberPath<Integer> affectedBedRangeEnd = createNumber("affectedBedRangeEnd", Integer.class);

    public final NumberPath<Integer> affectedBedRangeStart = createNumber("affectedBedRangeStart", Integer.class);

    public final StringPath applicationMethod = createString("applicationMethod");

    public final QBed bed;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath pesticideName = createString("pesticideName");

    public final EnumPath<PestRecord.PestType> pestType = createEnum("pestType", PestRecord.PestType.class);

    public final DatePath<java.time.LocalDate> recordDate = createDate("recordDate", java.time.LocalDate.class);

    public final EnumPath<PestRecord.Severity> severity = createEnum("severity", PestRecord.Severity.class);

    public final StringPath treatment = createString("treatment");

    public final DatePath<java.time.LocalDate> treatmentDate = createDate("treatmentDate", java.time.LocalDate.class);

    public QPestRecord(String variable) {
        this(PestRecord.class, forVariable(variable), INITS);
    }

    public QPestRecord(Path<? extends PestRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPestRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPestRecord(PathMetadata metadata, PathInits inits) {
        this(PestRecord.class, metadata, inits);
    }

    public QPestRecord(Class<? extends PestRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.bed = inits.isInitialized("bed") ? new QBed(forProperty("bed"), inits.get("bed")) : null;
    }

}

