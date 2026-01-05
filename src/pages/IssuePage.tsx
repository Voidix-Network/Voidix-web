import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { issueService } from '@/services/issueService';
import { AnimatedSection, BreadcrumbNavigation, Button, Card, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import type { Issue, Tag } from '@/types/api';
import {
  Plus,
  Search,
  Filter,
  Clock,
  MessageSquare,
  Tag as TagIcon,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Pin,
} from 'lucide-react';
import { truncateTitleResponsive, truncateDescriptionResponsive } from '@/utils/textUtils';

/**
 * Issue页面组件 - 显示所有issues列表
 */
export const IssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, validateToken, user } = useAuthStore();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<number[]>([]);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 页面加载时验证token并获取issues和标签
  useEffect(() => {
    const init = async () => {
      await validateToken();
      await Promise.all([loadIssues(), loadAllTags()]);
    };
    init();
  }, [validateToken]);

  // 当页码或过滤条件改变时重新加载
  useEffect(() => {
    loadIssues();
  }, [currentPage, filterStatus]);

  // 加载所有标签
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

  // 加载issues列表（支持分页）
  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);

      // 调用分页API
      const response = await issueService.getIssues(currentPage, pageSize);

      if (response.success && response.issues) {
        setIssues(response.issues);

        // 更新分页信息
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

  // 过滤issues（前端过滤，用于搜索和标签）
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.author_username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;

    // 标签筛选：如果选择了标签，则Issue必须包含至少一个选中的标签
    const matchesTags =
      filterTags.length === 0 ||
      (issue.tags && issue.tags.some(tag => filterTags.includes(tag.id)));

    return matchesSearch && matchesStatus && matchesTags;
  });

  // 获取所有状态
  const allStatuses = ['all', ...new Set(issues.map(i => i.status))];

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      resolved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // 跳转到创建页面
  const handleCreateIssue = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/issue/create');
  };

  // 跳转到详情页面
  const handleIssueClick = (id: string) => {
    navigate(`/issue/${id}`);
  };

  // 分页控制
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // 搜索时重置到第一页
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 标签筛选切换
  const toggleTagFilter = (tagId: number) => {
    setFilterTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterTags([]);
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
        <AnimatedSection className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* 面包屑导航 */}
            <BreadcrumbNavigation className="mb-8" />

            {/* 页面标题和操作区域 */}
            <motion.div
              className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1
                className="text-4xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GradientText variant="primary">Issue 系统</GradientText>
              </motion.h1>

              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* 管理员标签管理按钮 */}
                {user?.isAdmin && (
                  <Button
                    onClick={() => navigate('/tag-manage')}
                    variant="secondary"
                    size="lg"
                    disabled={loading}
                  >
                    <TagIcon className="h-5 w-5 mr-2" />
                    标签管理
                  </Button>
                )}
                {/* 刷新按钮 */}
                <Button onClick={loadIssues} variant="secondary" size="lg" disabled={loading}>
                  <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Button onClick={handleCreateIssue} variant="primary" size="lg" disabled={loading}>
                  <Plus className="h-5 w-5 mr-2" />
                  创建 Issue
                </Button>
              </motion.div>
            </motion.div>

            {/* 搜索和过滤区域 */}
            <motion.div
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* 搜索框 */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder="搜索标题、描述或作者..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  />
                </div>

                {/* 状态过滤 */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-500" />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={e => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none"
                  >
                    {allStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all'
                          ? '所有状态'
                          : status === 'open'
                            ? '开放'
                            : status === 'in_progress'
                              ? '进行中'
                              : status === 'resolved'
                                ? '已解决'
                                : status === 'closed'
                                  ? '已关闭'
                                  : status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 标签筛选 */}
              {allTags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">标签筛选:</span>
                    {filterTags.length > 0 && (
                      <button
                        onClick={() => setFilterTags([])}
                        className="text-xs text-blue-400 hover:text-blue-300 ml-auto"
                      >
                        清除标签
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                      const isSelected = filterTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTagFilter(tag.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? 'ring-2 ring-white text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          }`}
                          style={{
                            backgroundColor: isSelected ? tag.color : 'transparent',
                            borderColor: tag.color,
                            borderWidth: '1px',
                            borderStyle: isSelected ? 'solid' : 'dashed',
                          }}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 筛选操作和信息 */}
              <div className="flex items-center justify-between gap-4">
                {/* 清除所有筛选按钮 */}
                {(searchTerm || filterStatus !== 'all' || filterTags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    清除所有筛选
                  </button>
                )}

                {/* 分页信息显示 */}
                <div className="text-sm text-gray-400 flex items-center gap-4 ml-auto">
                  <div>
                    {searchTerm || filterStatus !== 'all' || filterTags.length > 0 ? (
                      <>
                        筛选结果:{' '}
                        <span className="text-white font-semibold">{filteredIssues.length}</span> 个
                        <span className="text-gray-500 ml-1">(共 {totalItems} 个)</span>
                      </>
                    ) : (
                      <>
                        共 <span className="text-white font-semibold">{totalItems}</span> 个Issues
                      </>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    第 <span className="text-white font-semibold">{currentPage}</span> /{' '}
                    {totalPages} 页
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 错误信息 */}
            {error && (
              <motion.div
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Issues 列表 */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <motion.div
                className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-gray-400 text-lg">暂无符合条件的Issues</p>
                <p className="text-gray-500 text-sm mt-2">尝试调整搜索条件或创建新的Issue</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="grid gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {filteredIssues.map((issue, index) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        hover
                        variant="glass"
                        className="p-6 cursor-pointer"
                        onClick={() => handleIssueClick(issue.id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* 左侧内容 */}
                          <div className="flex-1 min-w-0">
                            {/* 置顶标签 - 独立显示 */}
                            {issue.pinned && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold border border-yellow-500/30">
                                  <Pin className="h-3 w-3" />
                                  置顶
                                  {issue.pin_priority > 0 && (
                                    <span className="ml-1 px-1 py-0.5 bg-yellow-500/30 rounded text-[10px]">
                                      P{issue.pin_priority}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}

                            {/* 标题和状态 - 同一行但分离 */}
                            <div className="flex items-start gap-3 mb-3">
                              <h3 className="text-xl font-semibold text-white hover:text-blue-300 transition-colors flex-1 min-w-0 break-words">
                                {truncateTitleResponsive(issue.title)}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${getStatusColor(issue.status)}`}
                              >
                                {issue.status === 'open'
                                  ? '开放'
                                  : issue.status === 'in_progress'
                                    ? '进行中'
                                    : issue.status === 'resolved'
                                      ? '已解决'
                                      : issue.status === 'closed'
                                        ? '已关闭'
                                        : issue.status}
                              </span>
                            </div>

                            {/* 描述 */}
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {truncateDescriptionResponsive(issue.description)}
                            </p>

                            {/* 标签 */}
                            {issue.tags && issue.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {issue.tags.map((tag: Tag) => (
                                  <span
                                    key={tag.id}
                                    className="px-2 py-1 rounded text-xs font-medium"
                                    style={{
                                      backgroundColor: `${tag.color}33`,
                                      color: tag.color,
                                      border: `1px solid ${tag.color}66`,
                                    }}
                                  >
                                    <TagIcon className="h-3 w-3 inline mr-1" />
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 底部信息 */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {issue.author_username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(issue.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {issue.comments.length}
                              </span>
                            </div>
                          </div>

                          {/* 右侧箭头（桌面端） */}
                          <div className="hidden md:flex items-center">
                            <div className="text-gray-500 hover:text-gray-300 transition-colors">
                              →
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* 分页控件 */}
                {totalPages > 1 && (
                  <motion.div
                    className="mt-8 flex items-center justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      onClick={goToPreviousPage}
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* 页码按钮 */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return page;
                    }).map(page => (
                      <Button
                        key={page}
                        onClick={() => goToPage(page)}
                        variant={currentPage === page ? 'primary' : 'secondary'}
                        size="sm"
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      onClick={goToNextPage}
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default IssuePage;
