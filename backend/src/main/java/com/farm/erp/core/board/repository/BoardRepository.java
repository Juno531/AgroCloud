package com.farm.erp.core.board.repository;

import com.farm.erp.core.board.domain.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    Page<Board> findByCompanyCode(String companyCode, Pageable pageable);
    
    // Custom query could be used for sorting notices first, or we can use two queries
    List<Board> findByCompanyCodeAndIsNoticeTrueOrderByCreatedAtDesc(String companyCode);
    Page<Board> findByCompanyCodeAndIsNoticeFalse(String companyCode, Pageable pageable);

    // For SUPER_ADMIN who has no company
    List<Board> findByIsNoticeTrueOrderByCreatedAtDesc();
    Page<Board> findByIsNoticeFalse(Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Board b WHERE b.author.id = :userId")
    void deleteByAuthorId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
