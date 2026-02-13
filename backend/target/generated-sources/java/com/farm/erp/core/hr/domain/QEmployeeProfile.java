package com.farm.erp.core.hr.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QEmployeeProfile is a Querydsl query type for EmployeeProfile
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QEmployeeProfile extends EntityPathBase<EmployeeProfile> {

    private static final long serialVersionUID = 1606291676L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QEmployeeProfile employeeProfile = new QEmployeeProfile("employeeProfile");

    public final StringPath accountHolder = createString("accountHolder");

    public final StringPath bankAccount = createString("bankAccount");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.farm.erp.core.farm.domain.QFarm farm;

    public final DatePath<java.time.LocalDate> hireDate = createDate("hireDate", java.time.LocalDate.class);

    public final NumberPath<java.math.BigDecimal> hourlyWage = createNumber("hourlyWage", java.math.BigDecimal.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Integer> paymentDate = createNumber("paymentDate", Integer.class);

    public final StringPath phone = createString("phone");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public final com.farm.erp.core.auth.domain.QUser user;

    public QEmployeeProfile(String variable) {
        this(EmployeeProfile.class, forVariable(variable), INITS);
    }

    public QEmployeeProfile(Path<? extends EmployeeProfile> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QEmployeeProfile(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QEmployeeProfile(PathMetadata metadata, PathInits inits) {
        this(EmployeeProfile.class, metadata, inits);
    }

    public QEmployeeProfile(Class<? extends EmployeeProfile> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.farm = inits.isInitialized("farm") ? new com.farm.erp.core.farm.domain.QFarm(forProperty("farm"), inits.get("farm")) : null;
        this.user = inits.isInitialized("user") ? new com.farm.erp.core.auth.domain.QUser(forProperty("user")) : null;
    }

}

