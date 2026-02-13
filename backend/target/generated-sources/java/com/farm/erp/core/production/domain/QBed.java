package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QBed is a Querydsl query type for Bed
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QBed extends EntityPathBase<Bed> {

    private static final long serialVersionUID = 1663540659L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QBed bed = new QBed("bed");

    public final BooleanPath active = createBoolean("active");

    public final NumberPath<Integer> bedNumber = createNumber("bedNumber", Integer.class);

    public final NumberPath<Integer> columnPosition = createNumber("columnPosition", Integer.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Double> lengthMeters = createNumber("lengthMeters", Double.class);

    public final QLine line;

    public final StringPath name = createString("name");

    public final NumberPath<Integer> plantCapacity = createNumber("plantCapacity", Integer.class);

    public final NumberPath<Integer> rowPosition = createNumber("rowPosition", Integer.class);

    public QBed(String variable) {
        this(Bed.class, forVariable(variable), INITS);
    }

    public QBed(Path<? extends Bed> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QBed(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QBed(PathMetadata metadata, PathInits inits) {
        this(Bed.class, metadata, inits);
    }

    public QBed(Class<? extends Bed> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.line = inits.isInitialized("line") ? new QLine(forProperty("line"), inits.get("line")) : null;
    }

}

