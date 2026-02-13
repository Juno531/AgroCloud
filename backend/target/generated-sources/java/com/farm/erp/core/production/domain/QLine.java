package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QLine is a Querydsl query type for Line
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QLine extends EntityPathBase<Line> {

    private static final long serialVersionUID = 30455042L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QLine line = new QLine("line");

    public final BooleanPath active = createBoolean("active");

    public final NumberPath<Integer> bedCount = createNumber("bedCount", Integer.class);

    public final StringPath description = createString("description");

    public final QHouse house;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Double> lengthMeters = createNumber("lengthMeters", Double.class);

    public final NumberPath<Integer> lineNumber = createNumber("lineNumber", Integer.class);

    public final StringPath name = createString("name");

    public QLine(String variable) {
        this(Line.class, forVariable(variable), INITS);
    }

    public QLine(Path<? extends Line> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QLine(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QLine(PathMetadata metadata, PathInits inits) {
        this(Line.class, metadata, inits);
    }

    public QLine(Class<? extends Line> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.house = inits.isInitialized("house") ? new QHouse(forProperty("house"), inits.get("house")) : null;
    }

}

