package com.farm.erp.core.board.controller;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.board.dto.BoardDto;
import com.farm.erp.core.board.service.BoardService;
import com.farm.erp.core.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
@Tag(name = "03. Board", description = "Board Management API")
public class BoardController {

    private final BoardService boardService;
    private final UserRepository userRepository;

    @Operation(summary = "Get Board List")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getBoards(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        String companyCode = user.getCompany() != null ? user.getCompany().getCode() : null;
        
        List<BoardDto.Response> notices = boardService.getNoticeBoards(companyCode);
        Page<BoardDto.Response> boardPage = boardService.getNormalBoards(companyCode, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("notices", notices);
        response.put("boards", boardPage.getContent());
        response.put("totalPages", boardPage.getTotalPages());
        response.put("totalElements", boardPage.getTotalElements());
        response.put("currentPage", boardPage.getNumber());
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get Board Details")
    @GetMapping("/{id}")
    public ResponseEntity<BoardDto.Response> getBoardById(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    @Operation(summary = "Create Board Post")
    @PostMapping
    public ResponseEntity<BoardDto.Response> createBoard(
            @Valid @RequestBody BoardDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String companyCode = user.getCompany() != null ? user.getCompany().getCode() : null;
        return ResponseEntity.ok(boardService.createBoard(request, user, companyCode));
    }

    @Operation(summary = "Update Board Post")
    @PutMapping("/{id}")
    public ResponseEntity<BoardDto.Response> updateBoard(
            @PathVariable("id") Long id,
            @Valid @RequestBody BoardDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(boardService.updateBoard(id, request, user));
    }

    @Operation(summary = "Delete Board Post")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        boardService.deleteBoard(id, user);
        return ResponseEntity.ok().build();
    }
}
