package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QNutrientRecord is a Querydsl query type for NutrientRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QNutrientRecord extends EntityPathBase<NutrientRecord> {

    private static final long serialVersionUID = 1736530598L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QNutrientRecord nutrientRecord = new QNutrientRecord("nutrientRecord");

    public final QBed bed;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Integer> drainAmount = createNumber("drainAmount", Integer.class);

    public final NumberPath<Double> drainEc = createNumber("drainEc", Double.class);

    public final NumberPath<Double> drainPh = createNumber("drainPh", Double.class);

    public final NumberPath<Double> drainRate = createNumber("drainRate", Double.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath notes = createString("notes");

    public final QPlanting planting;

    public final DatePath<java.time.LocalDate> recordDate = createDate("recordDate", java.time.LocalDate.class);

    public final NumberPath<Integer> supplyAmount = createNumber("supplyAmount", Integer.class);

    public final NumberPath<Double> supplyEc = createNumber("supplyEc", Double.class);

    public final NumberPath<Double> supplyPh = createNumber("supplyPh", Double.class);

    public QNutrientRecord(String variable) {
        this(NutrientRecord.class, forVariable(variable), INITS);
    }

    public QNutrientRecord(Path<? extends NutrientRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QNutrientRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QNutrientRecord(PathMetadata metadata, PathInits inits) {
        this(NutrientRecord.class, metadata, inits);
    }

    public QNutrientRecord(Class<? extends NutrientRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.bed = inits.isInitialized("bed") ? new QBed(forProperty("bed"), inits.get("bed")) : null;
        this.planting = inits.isInitialized("planting") ? new QPlanting(forProperty("planting"), inits.get("planting")) : null;
    }

}

