import type {
  GetIssuesResponse,
  GetIssueResponse,
  CreateIssueRequest,
  CreateIssueResponse,
  UpdateIssueRequest,
  UpdateIssueResponse,
  DeleteIssueRequest,
  DeleteIssueResponse,
  AddCommentRequest,
  AddCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  Tag,
  Issue,
} from '@/types/api';

const API_BASE_URL = 'https://webba.voidix.net:5699';

/**
 * Issue服务 - 处理issue相关的API调用
 */
export class IssueService {
  private static instance: IssueService;

  public static getInstance(): IssueService {
    if (!IssueService.instance) {
      IssueService.instance = new IssueService();
    }
    return IssueService.instance;
  }

  /**
   * 获取Authorization Header
   */
  private getAuthHeader(): Record<string, string> {
    const stored = localStorage.getItem('voidix_user');
    if (stored) {
      try {
        const userInfo = JSON.parse(stored);
        if (userInfo && userInfo.token) {
          return { Authorization: `Bearer ${userInfo.token}` };
        }
      } catch {}
    }
    return {};
  }

  /**
   * 获取所有Issues（支持分页）
   */
  async getIssues(page: number = 1, pageSize: number = 20): Promise<GetIssuesResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/issue/get_issues?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
          },
          credentials: 'include',
        }
      );

      const data: GetIssuesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取issues失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取issues失败',
      };
    }
  }

  /**
   * 获取单个Issue
   */
  async getIssue(id: string): Promise<GetIssueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/get_issue?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
      });

      const data: GetIssueResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取issue失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取issue失败',
      };
    }
  }

  /**
   * 创建Issue
   */
  async createIssue(request: CreateIssueRequest): Promise<CreateIssueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data: CreateIssueResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建issue失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建issue失败',
      };
    }
  }

  /**
   * 更新Issue
   */
  async updateIssue(request: UpdateIssueRequest): Promise<UpdateIssueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data: UpdateIssueResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新issue失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新issue失败',
      };
    }
  }

  /**
   * 删除Issue
   */
  async deleteIssue(request: DeleteIssueRequest): Promise<DeleteIssueResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data: DeleteIssueResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除issue失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除issue失败',
      };
    }
  }

  /**
   * 添加评论
   */
  async addComment(request: AddCommentRequest): Promise<AddCommentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/add_comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data: AddCommentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '添加评论失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加评论失败',
      };
    }
  }

  /**
   * 删除评论
   */
  async deleteComment(request: DeleteCommentRequest): Promise<DeleteCommentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/delete_comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data: DeleteCommentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除评论失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除评论失败',
      };
    }
  }

  /**
   * 获取所有标签
   */
  async getTags(): Promise<{ success: boolean; tags?: Tag[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tag/get_tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取标签失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取标签失败',
      };
    }
  }

  /**
   * 创建标签（管理员）
   */
  async createTag(
    name: string,
    color: string
  ): Promise<{ success: boolean; tag?: Tag; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tag/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify({ name, color }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建标签失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建标签失败',
      };
    }
  }

  /**
   * 更新标签（管理员）
   */
  async updateTag(
    id: number,
    name: string,
    color: string
  ): Promise<{ success: boolean; tag?: Tag; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tag/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify({ id, name, color }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新标签失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新标签失败',
      };
    }
  }

  /**
   * 删除标签（管理员）
   */
  async deleteTag(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tag/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除标签失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除标签失败',
      };
    }
  }

  /**
   * 置顶/取消置顶Issue（管理员）
   */
  async pinIssue(request: {
    id: string;
    pinned: boolean;
    pin_priority?: number;
  }): Promise<{ success: boolean; message?: string; issue?: Issue; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '置顶操作失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '置顶操作失败',
      };
    }
  }
}

export const issueService = IssueService.getInstance();
