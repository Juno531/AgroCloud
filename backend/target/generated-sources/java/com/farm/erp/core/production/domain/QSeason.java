package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSeason is a Querydsl query type for Season
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSeason extends EntityPathBase<Season> {

    private static final long serialVersionUID = -601136015L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSeason season = new QSeason("season");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final StringPath description = createString("description");

    public final DatePath<java.time.LocalDate> endDate = createDate("endDate", java.time.LocalDate.class);

    public final com.farm.erp.core.farm.domain.QFarm farm;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final DatePath<java.time.LocalDate> startDate = createDate("startDate", java.time.LocalDate.class);

    public final EnumPath<SeasonStatus> status = createEnum("status", SeasonStatus.class);

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QSeason(String variable) {
        this(Season.class, forVariable(variable), INITS);
    }

    public QSeason(Path<? extends Season> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSeason(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSeason(PathMetadata metadata, PathInits inits) {
        this(Season.class, metadata, inits);
    }

    public QSeason(Class<? extends Season> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.farm = inits.isInitialized("farm") ? new com.farm.erp.core.farm.domain.QFarm(forProperty("farm"), inits.get("farm")) : null;
    }

}

