package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QGrowthRecord is a Querydsl query type for GrowthRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QGrowthRecord extends EntityPathBase<GrowthRecord> {

    private static final long serialVersionUID = 1421582342L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QGrowthRecord growthRecord = new QGrowthRecord("growthRecord");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Double> crownDiameterMm = createNumber("crownDiameterMm", Double.class);

    public final NumberPath<Integer> flowerClusterCount = createNumber("flowerClusterCount", Integer.class);

    public final DatePath<java.time.LocalDate> floweringDate = createDate("floweringDate", java.time.LocalDate.class);

    public final NumberPath<Integer> fruitCount = createNumber("fruitCount", Integer.class);

    public final DatePath<java.time.LocalDate> fruitingDate = createDate("fruitingDate", java.time.LocalDate.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Integer> leafCount = createNumber("leafCount", Integer.class);

    public final NumberPath<Double> leafLengthCm = createNumber("leafLengthCm", Double.class);

    public final NumberPath<Double> leafWidthCm = createNumber("leafWidthCm", Double.class);

    public final StringPath notes = createString("notes");

    public final NumberPath<Double> plantHeightCm = createNumber("plantHeightCm", Double.class);

    public final QPlanting planting;

    public final DatePath<java.time.LocalDate> recordDate = createDate("recordDate", java.time.LocalDate.class);

    public QGrowthRecord(String variable) {
        this(GrowthRecord.class, forVariable(variable), INITS);
    }

    public QGrowthRecord(Path<? extends GrowthRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QGrowthRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QGrowthRecord(PathMetadata metadata, PathInits inits) {
        this(GrowthRecord.class, metadata, inits);
    }

    public QGrowthRecord(Class<? extends GrowthRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.planting = inits.isInitialized("planting") ? new QPlanting(forProperty("planting"), inits.get("planting")) : null;
    }

}

