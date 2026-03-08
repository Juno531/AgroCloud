package com.farm.erp.core.board.dto;

import com.farm.erp.core.board.domain.Board;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class BoardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "제목은 필수입니다.")
        private String title;

        @NotBlank(message = "내용은 필수입니다.")
        private String content;

        private boolean isNotice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private int viewCount;
        private boolean isNotice;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private AuthorDto author;

        public static Response fromEntity(Board board) {
            return Response.builder()
                    .id(board.getId())
                    .title(board.getTitle())
                    .content(board.getContent())
                    .viewCount(board.getViewCount())
                    .isNotice(board.isNotice())
                    .createdAt(board.getCreatedAt())
                    .updatedAt(board.getUpdatedAt())
                    .author(new AuthorDto(board.getAuthor().getId(), board.getAuthor().getName()))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    public static class AuthorDto {
        private Long id;
        private String name;
    }
}
