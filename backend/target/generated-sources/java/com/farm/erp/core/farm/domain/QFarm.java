package com.farm.erp.core.farm.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QFarm is a Querydsl query type for Farm
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QFarm extends EntityPathBase<Farm> {

    private static final long serialVersionUID = 1037496321L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QFarm farm = new QFarm("farm");

    public final NumberPath<java.math.BigDecimal> area = createNumber("area", java.math.BigDecimal.class);

    public final StringPath contactNumber = createString("contactNumber");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final StringPath description = createString("description");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath location = createString("location");

    public final StringPath name = createString("name");

    public final StringPath ownerName = createString("ownerName");

    public final EnumPath<FarmStatus> status = createEnum("status", FarmStatus.class);

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public final com.farm.erp.core.auth.domain.QUser user;

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public QFarm(String variable) {
        this(Farm.class, forVariable(variable), INITS);
    }

    public QFarm(Path<? extends Farm> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QFarm(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QFarm(PathMetadata metadata, PathInits inits) {
        this(Farm.class, metadata, inits);
    }

    public QFarm(Class<? extends Farm> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.farm.erp.core.auth.domain.QUser(forProperty("user")) : null;
    }

}

