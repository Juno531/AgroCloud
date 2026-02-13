package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPlanting is a Querydsl query type for Planting
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPlanting extends EntityPathBase<Planting> {

    private static final long serialVersionUID = -1186467931L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPlanting planting = new QPlanting("planting");

    public final QBed bed;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final QCrop crop;

    public final DatePath<java.time.LocalDate> expectedHarvestDate = createDate("expectedHarvestDate", java.time.LocalDate.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath notes = createString("notes");

    public final NumberPath<Integer> plantCount = createNumber("plantCount", Integer.class);

    public final DatePath<java.time.LocalDate> plantingDate = createDate("plantingDate", java.time.LocalDate.class);

    public final QSeason season;

    public final EnumPath<Planting.PlantingStatus> status = createEnum("status", Planting.PlantingStatus.class);

    public QPlanting(String variable) {
        this(Planting.class, forVariable(variable), INITS);
    }

    public QPlanting(Path<? extends Planting> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPlanting(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPlanting(PathMetadata metadata, PathInits inits) {
        this(Planting.class, metadata, inits);
    }

    public QPlanting(Class<? extends Planting> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.bed = inits.isInitialized("bed") ? new QBed(forProperty("bed"), inits.get("bed")) : null;
        this.crop = inits.isInitialized("crop") ? new QCrop(forProperty("crop")) : null;
        this.season = inits.isInitialized("season") ? new QSeason(forProperty("season"), inits.get("season")) : null;
    }

}

