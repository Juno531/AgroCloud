package com.farm.erp.core.harvest.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QHarvestDetail is a Querydsl query type for HarvestDetail
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QHarvestDetail extends EntityPathBase<HarvestDetail> {

    private static final long serialVersionUID = -1347667026L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QHarvestDetail harvestDetail = new QHarvestDetail("harvestDetail");

    public final NumberPath<Integer> boxCount = createNumber("boxCount", Integer.class);

    public final EnumPath<HarvestGrade> grade = createEnum("grade", HarvestGrade.class);

    public final QHarvestRecord harvestRecord;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<java.math.BigDecimal> weightKg = createNumber("weightKg", java.math.BigDecimal.class);

    public QHarvestDetail(String variable) {
        this(HarvestDetail.class, forVariable(variable), INITS);
    }

    public QHarvestDetail(Path<? extends HarvestDetail> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QHarvestDetail(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QHarvestDetail(PathMetadata metadata, PathInits inits) {
        this(HarvestDetail.class, metadata, inits);
    }

    public QHarvestDetail(Class<? extends HarvestDetail> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.harvestRecord = inits.isInitialized("harvestRecord") ? new QHarvestRecord(forProperty("harvestRecord"), inits.get("harvestRecord")) : null;
    }

}

