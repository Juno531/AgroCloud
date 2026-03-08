export interface BoardUser {
  id: number;
  name: string;
}

export interface BoardPost {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string | null;
  author: BoardUser;
}

export interface BoardResponse {
  notices: BoardPost[];
  boards: BoardPost[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface BoardRequest {
  title: string;
  content: string;
  isNotice: boolean;
}
