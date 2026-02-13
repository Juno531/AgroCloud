package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QHouseLayout is a Querydsl query type for HouseLayout
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QHouseLayout extends EntityPathBase<HouseLayout> {

    private static final long serialVersionUID = -518609508L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QHouseLayout houseLayout = new QHouseLayout("houseLayout");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.farm.erp.core.farm.domain.QFarm farm;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath layoutData = createString("layoutData");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QHouseLayout(String variable) {
        this(HouseLayout.class, forVariable(variable), INITS);
    }

    public QHouseLayout(Path<? extends HouseLayout> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QHouseLayout(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QHouseLayout(PathMetadata metadata, PathInits inits) {
        this(HouseLayout.class, metadata, inits);
    }

    public QHouseLayout(Class<? extends HouseLayout> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.farm = inits.isInitialized("farm") ? new com.farm.erp.core.farm.domain.QFarm(forProperty("farm"), inits.get("farm")) : null;
    }

}

