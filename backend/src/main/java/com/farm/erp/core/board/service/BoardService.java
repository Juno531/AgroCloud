package com.farm.erp.core.board.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.board.domain.Board;
import com.farm.erp.core.board.dto.BoardDto;
import com.farm.erp.core.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    public Page<BoardDto.Response> getBoards(String companyCode, Pageable pageable) {
        return boardRepository.findByCompanyCode(companyCode, pageable)
                .map(BoardDto.Response::fromEntity);
    }

    public List<BoardDto.Response> getNoticeBoards(String companyCode) {
        if (companyCode == null) {
            return boardRepository.findByIsNoticeTrueOrderByCreatedAtDesc().stream()
                    .map(BoardDto.Response::fromEntity)
                    .collect(Collectors.toList());
        }
        return boardRepository.findByCompanyCodeAndIsNoticeTrueOrderByCreatedAtDesc(companyCode).stream()
                .map(BoardDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<BoardDto.Response> getNormalBoards(String companyCode, Pageable pageable) {
        if (companyCode == null) {
            return boardRepository.findByIsNoticeFalse(pageable)
                    .map(BoardDto.Response::fromEntity);
        }
        return boardRepository.findByCompanyCodeAndIsNoticeFalse(companyCode, pageable)
                .map(BoardDto.Response::fromEntity);
    }

    @Transactional
    public BoardDto.Response getBoardById(Long id) {
        Board board = findBoardById(id);
        board.incrementViewCount();
        return BoardDto.Response.fromEntity(board);
    }

    @Transactional
    public BoardDto.Response createBoard(BoardDto.Request request, User user, String companyCode) {
        validateAdminAccess(user);

        Board board = Board.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isNotice(request.isNotice())
                .author(user)
                .company(user.getCompany())
                .build();

        Board savedBoard = boardRepository.save(board);
        return BoardDto.Response.fromEntity(savedBoard);
    }

    @Transactional
    public BoardDto.Response updateBoard(Long id, BoardDto.Request request, User user) {
        Board board = findBoardById(id);
        
        validateModifyAccess(board, user);

        board.update(request.getTitle(), request.getContent(), request.isNotice());
        return BoardDto.Response.fromEntity(board);
    }

    @Transactional
    public void deleteBoard(Long id, User user) {
        Board board = findBoardById(id);
        
        validateModifyAccess(board, user);
        
        boardRepository.delete(board);
    }

    private Board findBoardById(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    }

    private void validateAdminAccess(User user) {
        if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.MASTER_ADMIN && user.getRole() != User.Role.SUPER_ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateModifyAccess(Board board, User user) {
        if (user.getRole() == User.Role.MASTER_ADMIN || user.getRole() == User.Role.SUPER_ADMIN) {
            return; // MASTER_ADMIN/SUPER_ADMIN can edit/delete any post
        }

        validateAdminAccess(user); // Ensure at least ADMIN

        if (!board.getAuthor().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN); // ADMIN can only edit their own post
        }
    }
}
