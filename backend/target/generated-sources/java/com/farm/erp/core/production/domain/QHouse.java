package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QHouse is a Querydsl query type for House
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QHouse extends EntityPathBase<House> {

    private static final long serialVersionUID = 940598226L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QHouse house = new QHouse("house");

    public final BooleanPath active = createBoolean("active");

    public final NumberPath<Double> area = createNumber("area", Double.class);

    public final StringPath description = createString("description");

    public final com.farm.erp.core.farm.domain.QFarm farm;

    public final StringPath houseType = createString("houseType");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Double> length = createNumber("length", Double.class);

    public final StringPath name = createString("name");

    public final NumberPath<Double> width = createNumber("width", Double.class);

    public QHouse(String variable) {
        this(House.class, forVariable(variable), INITS);
    }

    public QHouse(Path<? extends House> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QHouse(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QHouse(PathMetadata metadata, PathInits inits) {
        this(House.class, metadata, inits);
    }

    public QHouse(Class<? extends House> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.farm = inits.isInitialized("farm") ? new com.farm.erp.core.farm.domain.QFarm(forProperty("farm"), inits.get("farm")) : null;
    }

}

