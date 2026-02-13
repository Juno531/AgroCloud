package com.farm.erp.core.production.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QCrop is a Querydsl query type for Crop
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCrop extends EntityPathBase<Crop> {

    private static final long serialVersionUID = 30195614L;

    public static final QCrop crop = new QCrop("crop");

    public final StringPath description = createString("description");

    public final NumberPath<Integer> growthDurationDays = createNumber("growthDurationDays", Integer.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final StringPath scientificName = createString("scientificName");

    public final NumberPath<Integer> standardGrowthDays = createNumber("standardGrowthDays", Integer.class);

    public final StringPath variety = createString("variety");

    public QCrop(String variable) {
        super(Crop.class, forVariable(variable));
    }

    public QCrop(Path<? extends Crop> path) {
        super(path.getType(), path.getMetadata());
    }

    public QCrop(PathMetadata metadata) {
        super(Crop.class, metadata);
    }

}

