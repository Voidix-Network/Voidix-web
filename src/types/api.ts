/**
 * API相关类型定义
 */

// 认证相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  username?: string;
  player_uuid?: string;
  isAdmin?: boolean;
  error?: string;
}

export interface ValidateResponse {
  valid: boolean;
  username?: string;
  player_uuid?: string;
  expires_at?: string;
  isAdmin?: boolean;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Issue相关类型
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  message: string;
  author_uuid: string;
  author_username: string;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  author_uuid: string;
  author_username: string;
  status: string;
  created_at: string;
  pinned: boolean;
  pin_priority: number;
  comments: Comment[];
  tags: Tag[];
}

export interface GetIssuesResponse {
  success: boolean;
  issues?: Issue[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  error?: string;
}

export interface GetIssueResponse {
  success: boolean;
  issue?: Issue;
  error?: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  status?: string;
  tags?: number[];
}

export interface CreateIssueResponse {
  success: boolean;
  issue?: Issue;
  error?: string;
}

export interface UpdateIssueRequest {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  tags?: number[];
}

export interface UpdateIssueResponse {
  success: boolean;
  issue?: Issue;
  error?: string;
}

export interface DeleteIssueRequest {
  id: string;
}

export interface DeleteIssueResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AddCommentRequest {
  issue_id: string;
  message: string;
}

export interface AddCommentResponse {
  success: boolean;
  comment?: Comment;
  error?: string;
}

export interface DeleteCommentRequest {
  issue_id: string;
  comment_id: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PinIssueRequest {
  id: string;
  pinned: boolean;
  pin_priority?: number;
}

export interface PinIssueResponse {
  success: boolean;
  message?: string;
  issue?: Issue;
  error?: string;
}

// 通用API响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 用户信息
export interface UserInfo {
  username: string;
  player_uuid: string;
  token: string;
  isAdmin?: boolean;
}
