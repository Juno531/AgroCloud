package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QWorkRecord is a Querydsl query type for WorkRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QWorkRecord extends EntityPathBase<WorkRecord> {

    private static final long serialVersionUID = -19312304L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QWorkRecord workRecord = new QWorkRecord("workRecord");

    public final QBed bed;

    public final EnumPath<WorkRecord.CompletionStatus> completionStatus = createEnum("completionStatus", WorkRecord.CompletionStatus.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Integer> durationMinutes = createNumber("durationMinutes", Integer.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath notes = createString("notes");

    public final DatePath<java.time.LocalDate> workDate = createDate("workDate", java.time.LocalDate.class);

    public final NumberPath<Integer> workerCount = createNumber("workerCount", Integer.class);

    public final EnumPath<WorkRecord.WorkType> workType = createEnum("workType", WorkRecord.WorkType.class);

    public QWorkRecord(String variable) {
        this(WorkRecord.class, forVariable(variable), INITS);
    }

    public QWorkRecord(Path<? extends WorkRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QWorkRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QWorkRecord(PathMetadata metadata, PathInits inits) {
        this(WorkRecord.class, metadata, inits);
    }

    public QWorkRecord(Class<? extends WorkRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.bed = inits.isInitialized("bed") ? new QBed(forProperty("bed"), inits.get("bed")) : null;
    }

}

