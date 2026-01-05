import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { issueService } from '@/services/issueService';
import { AnimatedSection, BreadcrumbNavigation, Button, Card, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import { Issue, Comment, Tag } from '@/types/api';
import {
  Clock,
  MessageSquare,
  Tag as TagIcon,
  User,
  Trash2,
  Edit2,
  ArrowLeft,
  RefreshCw,
  Pin,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * Issue详情页面组件
 */
export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, validateToken } = useAuthStore();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentMessage, setCommentMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 轮询相关状态
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasNewData, setHasNewData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timeDisplay, setTimeDisplay] = useState('');

  // 置顶优先级编辑状态
  const [showPriorityEditor, setShowPriorityEditor] = useState(false);
  const [editingPriority, setEditingPriority] = useState(5);

  // 页面加载时验证token并获取issue详情
  useEffect(() => {
    const init = async () => {
      await validateToken();
      if (id) {
        await loadIssue(id);
        startPolling();
      }
    };
    init();

    return () => {
      stopPolling();
    };
  }, [validateToken, id]);

  // 实时更新时间显示
  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeDisplay = () => {
      const display = formatRelativeTime(lastUpdate);
      setTimeDisplay(display);
    };

    updateTimeDisplay();
    const interval = setInterval(updateTimeDisplay, 10000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // 开始轮询
  const startPolling = () => {
    stopPolling();
    intervalRef.current = setInterval(() => {
      if (id) pollIssue();
    }, 60000);
  };

  // 停止轮询
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 轮询获取issue
  const pollIssue = async () => {
    if (!id) return;

    try {
      const response = await issueService.getIssue(id);

      if (response.success && response.issue) {
        const newIssue = response.issue;

        if (issue) {
          const hasChanges =
            newIssue.status !== issue.status ||
            newIssue.title !== issue.title ||
            newIssue.description !== issue.description ||
            newIssue.comments.length !== issue.comments.length ||
            newIssue.tags.length !== issue.tags.length;

          if (hasChanges) {
            setHasNewData(true);
            setTimeout(() => {
              setIssue(newIssue);
              setLastUpdate(new Date());
              setHasNewData(false);
            }, 300);
          }
        } else {
          setIssue(newIssue);
          setLastUpdate(new Date());
        }
      }
    } catch (err) {
      console.error('轮询失败:', err);
    }
  };

  // 手动刷新
  const handleManualRefresh = async () => {
    if (!id) return;
    await loadIssue(id);
  };

  // 加载issue详情
  const loadIssue = async (issueId: string) => {
    try {
      setError(null);
      const response = await issueService.getIssue(issueId);

      if (response.success && response.issue) {
        setIssue(response.issue);
        setLastUpdate(new Date());
      } else {
        setError(response.error || '获取issue失败');
        navigate('/issue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取issue失败');
      navigate('/issue');
    } finally {
      setLoading(false);
    }
  };

  // 添加评论
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentMessage.trim() || !id || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const response = await issueService.addComment({
        issue_id: id,
        message: commentMessage.trim(),
      });

      if (response.success && response.comment) {
        await loadIssue(id);
        setCommentMessage('');
      } else {
        setError(response.error || '添加评论失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!id || !isAuthenticated) return;
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await issueService.deleteComment({
        issue_id: id,
        comment_id: commentId,
      });

      if (response.success) {
        await loadIssue(id);
      } else {
        setError(response.error || '删除评论失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除评论失败');
    }
  };

  // 删除issue
  const handleDeleteIssue = async () => {
    if (!id || !isAuthenticated || !issue) return;
    if (!canEdit) {
      setError('没有权限删除此issue');
      return;
    }
    if (!confirm('确定要删除这个Issue吗？此操作不可恢复。')) return;

    try {
      const response = await issueService.deleteIssue({ id });
      if (response.success) {
        navigate('/issue');
      } else {
        setError(response.error || '删除issue失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除issue失败');
    }
  };

  // 编辑issue
  const handleEditIssue = () => {
    if (!id) return;
    navigate(`/issue/edit/${id}`);
  };

  // 置顶/取消置顶
  const handlePinToggle = async () => {
    if (!id || !isAuthenticated || !issue || !isAdmin) return;

    // 如果是置顶操作，显示优先级编辑器
    if (!issue.pinned) {
      setEditingPriority(5);
      setShowPriorityEditor(true);
      return;
    }

    // 取消置顶
    try {
      const response = await issueService.pinIssue({
        id,
        pinned: false,
        pin_priority: 5,
      });

      if (response.success && response.issue) {
        setIssue(response.issue);
        setError(null);
      } else {
        setError(response.error || '置顶操作失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '置顶操作失败');
    }
  };

  // 确认置顶并设置优先级
  const handleConfirmPin = async () => {
    if (!id || !isAuthenticated || !issue || !isAdmin) return;

    try {
      const response = await issueService.pinIssue({
        id,
        pinned: true,
        pin_priority: editingPriority,
      });

      if (response.success && response.issue) {
        setIssue(response.issue);
        setError(null);
        setShowPriorityEditor(false);
      } else {
        setError(response.error || '置顶操作失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '置顶操作失败');
    }
  };

  // 更新置顶优先级
  const handleUpdatePriority = async () => {
    if (!id || !isAuthenticated || !issue || !isAdmin || !issue.pinned) return;

    try {
      const response = await issueService.pinIssue({
        id,
        pinned: true,
        pin_priority: editingPriority,
      });

      if (response.success && response.issue) {
        setIssue(response.issue);
        setError(null);
        setShowPriorityEditor(false);
      } else {
        setError(response.error || '更新优先级失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新优先级失败');
    }
  };

  // 修改状态
  const handleStatusChange = async (newStatus: string) => {
    if (!id || !isAuthenticated || !issue) return;
    if (!canChangeStatus) {
      setError('没有权限修改状态');
      return;
    }

    const currentStatus = issue.status;

    if (!isAdmin) {
      if (currentStatus === 'closed') {
        setError('已关闭的issue不能修改');
        return;
      }
      if (newStatus !== 'closed') {
        setError('作者只能关闭issue，不能修改为其他状态');
        return;
      }
    }

    try {
      const response = await issueService.updateIssue({
        id,
        status: newStatus,
      });

      if (response.success && response.issue) {
        setIssue(response.issue);
        setError(null);

        // 自动添加状态变更评论（使用Markdown）
        const statusLabels: Record<string, string> = {
          open: '开放',
          in_progress: '进行中',
          resolved: '已解决',
          closed: '已关闭',
        };

        const oldStatus = statusLabels[currentStatus] || currentStatus;
        const newStatusLabel = statusLabels[newStatus] || newStatus;

        const commentMessage = `将状态从 **"${oldStatus}"** 修改为 **"${newStatusLabel}"**`;

        issueService
          .addComment({
            issue_id: id,
            message: commentMessage,
          })
          .then(commentResponse => {
            if (commentResponse.success) {
              loadIssue(id);
            }
          });
      } else {
        setError(response.error || '状态修改失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '状态修改失败');
    }
  };

  // 返回列表
  const handleGoBack = () => {
    navigate('/issue');
  };

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

  // 格式化相对时间
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
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

  // Markdown自定义样式
  const markdownComponents = {
    // 自定义段落
    p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
    // 自定义代码
    code: ({ children }: any) => (
      <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-pink-300">
        {children}
      </code>
    ),
    // 自定义链接
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {children}
      </a>
    ),
    // 自定义列表
    li: ({ children }: any) => <li className="ml-4">{children}</li>,
  };

  // 权限判断
  const canEdit =
    isAuthenticated && issue && user && (issue.author_uuid === user.player_uuid || user.isAdmin);
  const canChangeStatus =
    isAuthenticated && issue && user && (issue.author_uuid === user.player_uuid || user.isAdmin);
  const isAdmin = user?.isAdmin || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return null;
  }

  return (
    <>
      <SEO
        pageKey="issue-detail"
        type="website"
        url={`https://www.voidix.net/issue/${id}`}
        canonicalUrl={`https://www.voidix.net/issue/${id}`}
        title={`${issue.title} - Issue详情`}
      />

      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* 面包屑导航 */}
            <BreadcrumbNavigation
              className="mb-8"
              items={[
                { label: '首页', href: '/' },
                { label: 'Issue系统', href: '/issue' },
                { label: '详情', isCurrentPage: true },
              ]}
            />

            {/* 顶部操作栏 */}
            <motion.div
              className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 左侧：返回和刷新按钮 */}
              <div className="flex items-center gap-2">
                <Button onClick={handleGoBack} variant="secondary" size="md">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回列表
                </Button>

                <Button onClick={handleManualRefresh} variant="secondary" size="md">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>

              {/* 中间：更新时间 */}
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {timeDisplay && (
                  <>
                    <span>更新于 {timeDisplay}</span>
                    {hasNewData && (
                      <motion.span
                        className="text-green-400 font-semibold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      >
                        • 有新内容
                      </motion.span>
                    )}
                  </>
                )}
              </div>

              {/* 右侧：置顶、编辑和删除 */}
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* 置顶按钮 - 仅管理员 */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePinToggle}
                      variant={issue.pinned ? 'primary' : 'secondary'}
                      size="md"
                      title={issue.pinned ? '取消置顶' : '置顶Issue'}
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      {issue.pinned ? '取消置顶' : '置顶'}
                    </Button>
                    {/* 修改优先级按钮 - 仅已置顶时显示 */}
                    {issue.pinned && (
                      <Button
                        onClick={() => {
                          setEditingPriority(issue.pin_priority || 5);
                          setShowPriorityEditor(true);
                        }}
                        variant="secondary"
                        size="md"
                        title="修改置顶优先级"
                      >
                        P{issue.pin_priority || 5}
                      </Button>
                    )}
                  </div>
                )}

                {/* 编辑按钮 - 作者或管理员 */}
                {canEdit && (
                  <Button onClick={handleEditIssue} variant="secondary" size="md">
                    <Edit2 className="h-4 w-4 mr-2" />
                    编辑
                  </Button>
                )}

                {/* 删除按钮 - 作者 */}
                {canEdit && (
                  <Button
                    onClick={handleDeleteIssue}
                    variant="outline"
                    size="md"
                    className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                )}
              </motion.div>
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

            {/* 置顶优先级编辑器弹窗 */}
            {showPriorityEditor && isAdmin && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowPriorityEditor(false)}
              >
                <motion.div
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    {issue?.pinned ? '修改置顶优先级' : '设置置顶优先级'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        优先级 (1-10，数字越大优先级越高)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editingPriority}
                        onChange={e =>
                          setEditingPriority(
                            Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                          )
                        }
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>最低 (1)</span>
                        <span>当前: P{editingPriority}</span>
                        <span>最高 (10)</span>
                      </div>
                    </div>

                    <div className="bg-gray-900/30 rounded-lg p-3 text-xs text-gray-400">
                      <p className="mb-1">
                        <strong className="text-gray-300">优先级说明：</strong>
                      </p>
                      <ul className="space-y-1 ml-4 list-disc">
                        <li>优先级高的Issue会排在前面</li>
                        <li>相同优先级按创建时间排序</li>
                        <li>建议重要公告使用 P8-P10</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={issue?.pinned ? handleUpdatePriority : handleConfirmPin}
                        variant="primary"
                        size="md"
                        className="flex-1"
                      >
                        {issue?.pinned ? '更新优先级' : '确认置顶'}
                      </Button>
                      <Button
                        onClick={() => setShowPriorityEditor(false)}
                        variant="outline"
                        size="md"
                        className="px-6"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Issue 主要内容 */}
            <AnimatePresence>
              <motion.div
                key={issue.id + (lastUpdate?.getTime() || 0)}
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* 标题和状态 - 改进布局 */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6 w-full">
                  <div className="flex-1 min-w-0">
                    {/* 置顶标签单独一行 */}
                    {issue.pinned && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-md text-xs font-semibold border border-yellow-500/30">
                          <Pin className="h-3.5 w-3.5" />
                          置顶
                          {issue.pin_priority > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-yellow-500/30 rounded text-[10px]">
                              P{issue.pin_priority}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* 标题独立 */}
                    <motion.h1
                      className="text-2xl sm:text-3xl font-bold text-white break-words"
                      animate={{ scale: hasNewData ? [1, 1.02, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {issue.title}
                    </motion.h1>
                  </div>

                  {/* 状态标签 */}
                  <motion.span
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border ${getStatusColor(issue.status)} flex-shrink-0 self-start`}
                    animate={{
                      backgroundColor: hasNewData
                        ? ['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.1)']
                        : 'transparent',
                    }}
                    transition={{ duration: 0.5 }}
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
                  </motion.span>
                </div>

                {/* 作者和时间 */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {issue.author_username}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(issue.created_at)}
                  </span>
                </div>

                {/* 标签 */}
                {issue.tags && issue.tags.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 mb-6"
                    animate={{ x: hasNewData ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                )}

                {/* 描述 - 支持Markdown */}
                <motion.div
                  className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/50"
                  animate={{ opacity: hasNewData ? [0.5, 1, 0.8, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="prose prose-invert max-w-none prose-sm"
                    style={{
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                    }}
                  >
                    <ReactMarkdown components={markdownComponents}>
                      {issue.description}
                    </ReactMarkdown>
                  </div>
                </motion.div>

                {/* 状态修改按钮区域 */}
                {canChangeStatus && (
                  <motion.div
                    className="mt-6 pt-6 border-t border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isAdmin ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">管理员操作:</span>
                        <select
                          value={issue.status}
                          onChange={e => handleStatusChange(e.target.value)}
                          className="px-3 py-2 rounded-md text-sm font-medium border bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        >
                          <option value="open">设为开放</option>
                          <option value="in_progress">设为进行中</option>
                          <option value="resolved">设为已解决</option>
                          <option value="closed">设为已关闭</option>
                        </select>
                      </div>
                    ) : issue.status !== 'closed' ? (
                      <Button
                        onClick={() => {
                          if (
                            confirm(
                              '确定要关闭这个Issue吗？\n\n注意：关闭后您将无法再次开启，只有管理员可以重新打开。'
                            )
                          ) {
                            handleStatusChange('closed');
                          }
                        }}
                        variant="primary"
                        size="md"
                      >
                        关闭 Issue
                      </Button>
                    ) : null}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* 评论区域 */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* 评论标题 */}
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-400" />
                <GradientText variant="primary">评论 ({issue.comments.length})</GradientText>
              </h2>

              {/* 添加评论表单 */}
              {isAuthenticated ? (
                <Card variant="glass" className="p-6">
                  <form onSubmit={handleAddComment} className="space-y-4">
                    <textarea
                      value={commentMessage}
                      onChange={e => setCommentMessage(e.target.value)}
                      placeholder="写下您的评论（支持Markdown语法）..."
                      className="w-full min-h-[100px] p-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-y"
                      disabled={submitting}
                      required
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        支持: **粗体**、*斜体*、`代码`、列表等
                      </span>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        loading={submitting}
                        disabled={!commentMessage.trim() || submitting}
                      >
                        发表评论
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card variant="glass" className="p-6 text-center">
                  <p className="text-gray-400 mb-4">请先登录以发表评论</p>
                  <Button onClick={() => navigate('/login')} variant="primary" size="md">
                    登录
                  </Button>
                </Card>
              )}

              {/* 评论列表 */}
              <div className="space-y-4">
                {issue.comments.length === 0 ? (
                  <Card variant="glass" className="p-8 text-center">
                    <p className="text-gray-400">暂无评论，快来发表第一条评论吧！</p>
                  </Card>
                ) : (
                  [...issue.comments]
                    .sort(
                      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                    .map((comment: Comment, index) => {
                      const isCommentAuthor =
                        isAuthenticated && user && comment.author_uuid === user.player_uuid;
                      const isIssueAuthor =
                        isAuthenticated && user && issue.author_uuid === user.player_uuid;
                      const canDeleteComment = isCommentAuthor || isIssueAuthor;

                      return (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * (index + 1) }}
                        >
                          <Card variant="glass" className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="font-semibold text-white">
                                    {comment.author_username}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(comment.created_at)}
                                  </span>
                                  {isCommentAuthor && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                      我的评论
                                    </span>
                                  )}
                                </div>
                                {/* 评论内容 - 支持Markdown */}
                                <div
                                  className="prose prose-invert max-w-none prose-sm"
                                  style={{
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  <ReactMarkdown components={markdownComponents}>
                                    {comment.message}
                                  </ReactMarkdown>
                                </div>
                              </div>

                              {canDeleteComment && (
                                <Button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:bg-red-900/20"
                                  title="删除评论"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                )}
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default IssueDetailPage;
