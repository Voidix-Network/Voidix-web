import { AnimatedSection, BreadcrumbNavigation } from '@/components';
import { SEO } from '@/components/seo';
import { issueService } from '@/services/issueService';
import { useAuthStore } from '@/stores/authStore';
import type { Issue, Tag } from '@/types/api';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  MessageSquare,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Settings,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Issue页面组件
 */
export const IssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, validateToken, user, logout } = useAuthStore();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const init = async () => {
      await validateToken();
      await Promise.all([loadIssues(), loadAllTags()]);
    };
    init();
  }, [validateToken]);

  useEffect(() => {
    loadIssues();
  }, [currentPage, filterStatus]);

  const loadAllTags = async () => {
    try {
      const response = await issueService.getTags();
      if (response.success && response.tags) {
        setAllTags(response.tags);
      }
    } catch (err) {
      console.error('加载标签失败:', err);
    }
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueService.getIssues(currentPage, pageSize);

      if (response.success && response.issues) {
        setIssues(response.issues);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      } else {
        setError(response.error || '获取issues失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取issues失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues
    .filter(issue => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.author_username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
      const matchesTags =
        filterTags.length === 0 ||
        (issue.tags && issue.tags.some(tag => filterTags.includes(tag.id)));
      return matchesSearch && matchesStatus && matchesTags;
    })
    .sort((a, b) => {
      // 置顶的永远排在最前面
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // 都置顶时按 pin_priority 排序（数字大的在前）
      if (a.pinned && b.pinned) {
        return (b.pin_priority || 0) - (a.pin_priority || 0);
      }
      // 非置顶按创建时间倒序
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const mins = Math.floor(diff / (1000 * 60));
        return mins <= 1 ? '刚刚' : `${mins}分钟前`;
      }
      return `${hours}小时前`;
    }
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-emerald-500/10 text-emerald-400',
      in_progress: 'bg-blue-500/10 text-blue-400',
      resolved: 'bg-violet-500/10 text-violet-400',
      closed: 'bg-gray-500/10 text-gray-400',
    };
    return styles[status] || 'bg-gray-500/10 text-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: '待处理',
      in_progress: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    };
    return labels[status] || status;
  };

  const handleCreateIssue = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/issue/create');
  };

  const toggleTagFilter = (tagId: number) => {
    setFilterTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  return (
    <>
      <SEO
        pageKey="issue"
        type="website"
        url="https://www.voidix.net/issue"
        canonicalUrl="https://www.voidix.net/issue"
      />

      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-10 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <BreadcrumbNavigation className="mb-6" />

            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-white">Issues</h1>
              <div className="flex items-center gap-2">
                {user?.isAdmin && (
                  <button
                    onClick={() => navigate('/tag-manage')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="标签管理"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={loadIssues}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                  title="刷新"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleCreateIssue}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  新建
                </button>
                {isAuthenticated && (
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors"
                    title="登出"
                  >
                    <LogOut className="h-4 w-4" />
                    登出
                  </button>
                )}
              </div>
            </div>

            {/* 筛选栏 */}
            <div className="bg-gray-800/40 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* 搜索 */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="搜索..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                  />
                </div>

                {/* 状态筛选 */}
                <div className="flex gap-1.5">
                  {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === status
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      {status === 'all' ? '全部' : getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 标签筛选 */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => {
                    const isSelected = filterTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagFilter(tag.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          isSelected ? 'ring-1 ring-white/30' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 统计 */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {searchTerm || filterStatus !== 'all' || filterTags.length > 0
                    ? `${filteredIssues.length} / ${totalItems} 条结果`
                    : `共 ${totalItems} 条`}
                </span>
                <span>
                  第 {currentPage} / {totalPages} 页
                </span>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* 列表 */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p>暂无数据</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredIssues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => navigate(`/issue/${issue.id}`)}
                    className="group bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* 主内容 */}
                      <div className="flex-1 min-w-0">
                        {/* 标题行 */}
                        <div className="flex items-center gap-2 mb-1.5">
                          {issue.pinned && (
                            <Pin className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                          )}
                          <h3 className="text-[15px] font-medium text-gray-100 group-hover:text-white truncate">
                            {issue.title}
                          </h3>
                        </div>

                        {/* 描述 */}
                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                          {issue.description}
                        </p>

                        {/* 底部信息 */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {issue.author_username}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(issue.created_at)}
                          </span>
                          {issue.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {issue.comments.length}
                            </span>
                          )}
                          {/* 标签 */}
                          {issue.tags && issue.tags.length > 0 && (
                            <div className="flex gap-1">
                              {issue.tags.slice(0, 3).map((tag: Tag) => (
                                <span
                                  key={tag.id}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                  style={{
                                    backgroundColor: `${tag.color}15`,
                                    color: tag.color,
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {issue.tags.length > 3 && (
                                <span className="text-gray-600">+{issue.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 状态 */}
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${getStatusStyle(issue.status)}`}
                      >
                        {getStatusLabel(issue.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default IssuePage;
