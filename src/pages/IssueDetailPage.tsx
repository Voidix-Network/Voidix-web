import { AnimatedSection, BreadcrumbNavigation, Button } from '@/components';
import { SEO } from '@/components/seo';
import { issueService } from '@/services/issueService';
import { useAuthStore } from '@/stores/authStore';
import { Comment, Issue, Tag } from '@/types/api';
import {
  ArrowLeft,
  Clock,
  Edit2,
  MessageSquare,
  Pin,
  RefreshCw,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, validateToken } = useAuthStore();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentMessage, setCommentMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showPriorityEditor, setShowPriorityEditor] = useState(false);
  const [editingPriority, setEditingPriority] = useState(5);

  // 权限判断 - 放在前面以便其他函数使用
  const isAdmin = user?.isAdmin || false;
  const canEdit =
    isAuthenticated && issue && user && (issue.author_uuid === user.player_uuid || isAdmin);
  const canChangeStatus = canEdit;

  useEffect(() => {
    const init = async () => {
      await validateToken();
      if (id) {
        await loadIssue(id);
        startPolling();
      }
    };
    init();
    return () => stopPolling();
  }, [validateToken, id]);

  const startPolling = () => {
    stopPolling();
    intervalRef.current = setInterval(() => {
      if (id) pollIssue();
    }, 60000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const pollIssue = async () => {
    if (!id) return;
    try {
      const response = await issueService.getIssue(id);
      if (response.success && response.issue) {
        setIssue(response.issue);
      }
    } catch (err) {
      console.error('轮询失败:', err);
    }
  };

  const loadIssue = async (issueId: string) => {
    try {
      setError(null);
      const response = await issueService.getIssue(issueId);
      if (response.success && response.issue) {
        setIssue(response.issue);
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentMessage.trim() || !id || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const response = await issueService.addComment({
        issue_id: id,
        message: commentMessage.trim(),
      });

      if (response.success) {
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

  const handleDeleteComment = async (commentId: string) => {
    if (!id || !isAuthenticated) return;
    if (!confirm('确定删除这条评论？')) return;

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

  const handleDeleteIssue = async () => {
    if (!id || !isAuthenticated || !issue) return;
    // 作者或管理员可以删除
    const canDelete = user && (issue.author_uuid === user.player_uuid || user.isAdmin);
    if (!canDelete) {
      setError('没有权限删除');
      return;
    }
    if (!confirm('确定删除这个Issue？此操作不可恢复。')) return;

    try {
      const response = await issueService.deleteIssue({ id });
      if (response.success) {
        navigate('/issue');
      } else {
        setError(response.error || '删除失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handlePinToggle = async () => {
    if (!id || !issue || !isAdmin) return;

    if (!issue.pinned) {
      setEditingPriority(5);
      setShowPriorityEditor(true);
      return;
    }

    try {
      const response = await issueService.pinIssue({ id, pinned: false, pin_priority: 5 });
      if (response.success && response.issue) {
        setIssue(response.issue);
      } else {
        setError(response.error || '操作失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleConfirmPin = async () => {
    if (!id || !issue || !isAdmin) return;

    try {
      const response = await issueService.pinIssue({
        id,
        pinned: true,
        pin_priority: editingPriority,
      });
      if (response.success && response.issue) {
        setIssue(response.issue);
        setShowPriorityEditor(false);
      } else {
        setError(response.error || '操作失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !issue) return;

    // 权限检查
    const canChange = user && (issue.author_uuid === user.player_uuid || user.isAdmin);
    if (!canChange) {
      setError('没有权限');
      return;
    }

    const currentStatus = issue.status;
    // 非管理员只能关闭自己的issue
    if (!isAdmin && (currentStatus === 'closed' || newStatus !== 'closed')) {
      setError('只能关闭Issue');
      return;
    }

    try {
      const response = await issueService.updateIssue({ id, status: newStatus });
      if (response.success && response.issue) {
        setIssue(response.issue);

        const labels: Record<string, string> = {
          open: '待处理',
          in_progress: '处理中',
          resolved: '已解决',
          closed: '已关闭',
        };
        await issueService.addComment({
          issue_id: id,
          message: `将状态从 **${labels[currentStatus] || currentStatus}** 改为 **${labels[newStatus] || newStatus}**`,
        });
        await loadIssue(id);
      } else {
        setError(response.error || '修改失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改失败');
    }
  };

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

  const markdownComponents = {
    p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
    code: ({ children }: any) => (
      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-pink-300">{children}</code>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline"
      >
        {children}
      </a>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!issue) return null;

  return (
    <>
      <SEO
        pageKey="issue-detail"
        type="website"
        url={`https://www.voidix.net/issue/${id}`}
        canonicalUrl={`https://www.voidix.net/issue/${id}`}
        title={`${issue.title} - Issue`}
      />

      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-10 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <BreadcrumbNavigation
              className="mb-6"
              items={[
                { label: '首页', href: '/' },
                { label: 'Issues', href: '/issue' },
                { label: '详情', isCurrentPage: true },
              ]}
            />

            {/* 顶部操作栏 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/issue')}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => id && loadIssue(id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="刷新"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                {isAdmin && (
                  <button
                    onClick={handlePinToggle}
                    className={`p-2 rounded-lg transition-colors ${
                      issue.pinned
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    title={issue.pinned ? '取消置顶' : '置顶'}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                )}

                {canEdit && (
                  <>
                    <button
                      onClick={() => navigate(`/issue/edit/${id}`)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDeleteIssue}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* 置顶优先级弹窗 */}
            {showPriorityEditor && (
              <div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
                onClick={() => setShowPriorityEditor(false)}
              >
                <div
                  className="bg-gray-800 rounded-xl p-6 w-full max-w-sm"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-lg font-medium text-white mb-4">设置置顶优先级</h3>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingPriority}
                    onChange={e =>
                      setEditingPriority(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4"
                  />
                  <p className="text-xs text-gray-500 mb-4">1-10，数字越大优先级越高</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirmPin}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      确认
                    </Button>
                    <Button
                      onClick={() => setShowPriorityEditor(false)}
                      variant="secondary"
                      size="sm"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Issue 内容 */}
            <div className="bg-gray-800/40 rounded-xl p-6 mb-6">
              {/* 头部 */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  {issue.pinned && (
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs mb-2">
                      <Pin className="h-3 w-3" />
                      <span>置顶 · P{issue.pin_priority}</span>
                    </div>
                  )}
                  <h1 className="text-xl font-semibold text-white break-words">{issue.title}</h1>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${getStatusStyle(issue.status)}`}
                >
                  {getStatusLabel(issue.status)}
                </span>
              </div>

              {/* 元信息 */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {issue.author_username}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(issue.created_at)}
                </span>
              </div>

              {/* 标签 */}
              {issue.tags && issue.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {issue.tags.map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 描述 */}
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown components={markdownComponents}>{issue.description}</ReactMarkdown>
              </div>

              {/* 状态操作 */}
              {canChangeStatus && (
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  {isAdmin ? (
                    <select
                      value={issue.status}
                      onChange={e => handleStatusChange(e.target.value)}
                      className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                    >
                      <option value="open">待处理</option>
                      <option value="in_progress">处理中</option>
                      <option value="resolved">已解决</option>
                      <option value="closed">已关闭</option>
                    </select>
                  ) : (
                    issue.status !== 'closed' && (
                      <Button
                        onClick={() => {
                          if (confirm('确定关闭？关闭后只有管理员可以重新打开。')) {
                            handleStatusChange('closed');
                          }
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        关闭 Issue
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* 评论区 */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-medium text-white mb-4">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                评论 ({issue.comments.length})
              </h2>

              {/* 评论输入 */}
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="bg-gray-800/40 rounded-xl p-4">
                    <textarea
                      value={commentMessage}
                      onChange={e => setCommentMessage(e.target.value)}
                      placeholder="写下你的评论..."
                      className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[80px]"
                      disabled={submitting}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-600">支持 Markdown</span>
                      <button
                        type="submit"
                        disabled={!commentMessage.trim() || submitting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-3.5 w-3.5" />
                        发送
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-800/40 rounded-xl p-4 text-center mb-6">
                  <p className="text-gray-500 text-sm mb-2">登录后可以发表评论</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    登录
                  </button>
                </div>
              )}

              {/* 评论列表 */}
              {issue.comments.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">暂无评论</div>
              ) : (
                <div className="space-y-3">
                  {[...issue.comments]
                    .sort(
                      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                    .map((comment: Comment) => {
                      const isCommentAuthor =
                        isAuthenticated && user && comment.author_uuid === user.player_uuid;
                      const isIssueAuthor =
                        isAuthenticated && user && issue.author_uuid === user.player_uuid;
                      const canDeleteComment = isAdmin || isCommentAuthor || isIssueAuthor;

                      return (
                        <div key={comment.id} className="bg-gray-800/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-300 font-medium">
                                {comment.author_username}
                              </span>
                              <span className="text-gray-600">·</span>
                              <span className="text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            {canDeleteComment && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none text-gray-400">
                            <ReactMarkdown components={markdownComponents}>
                              {comment.message}
                            </ReactMarkdown>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default IssueDetailPage;
