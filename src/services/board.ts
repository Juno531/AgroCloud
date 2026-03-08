import api from './api';
import { BoardResponse, BoardPost, BoardRequest } from '../types/board';

interface GetBoardsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const getBoards = async (params: { page: number; size: number }) => {
  const response = await api.get<BoardResponse>('/boards', { params });
  return response.data;
};

export const getBoardById = async (id: number) => {
  const response = await api.get<BoardPost>(`/boards/${id}`);
  return response.data;
};

export const createBoard = async (data: BoardRequest) => {
  const response = await api.post<BoardPost>('/boards', data);
  return response.data;
};

export const updateBoard = async (id: number, data: BoardRequest) => {
  const response = await api.put<BoardPost>(`/boards/${id}`, data);
  return response.data;
};

export const deleteBoard = async (id: number) => {
  await api.delete(`/boards/${id}`);
};
