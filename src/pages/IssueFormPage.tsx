import { AnimatedSection, BreadcrumbNavigation, Button } from '@/components';
import { SEO } from '@/components/seo';
import { issueService } from '@/services/issueService';
import { useAuthStore } from '@/stores/authStore';
import { Tag } from '@/types/api';
import { ArrowLeft, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const IssueFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, validateToken, user } = useAuthStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
  });

  const [originalData, setOriginalData] = useState({
    title: '',
    description: '',
    status: 'open',
    tags: [] as number[],
  });

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    const init = async () => {
      await validateToken();

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      await loadAllTags();

      if (id) {
        setIsEditMode(true);
        await loadIssue(id);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [validateToken, isAuthenticated, navigate, id]);

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

  const loadIssue = async (issueId: string) => {
    try {
      const response = await issueService.getIssue(issueId);

      if (response.success && response.issue) {
        const issue = response.issue;

        if (user && issue.author_uuid !== user.player_uuid && !user.isAdmin) {
          setError('没有权限编辑');
          navigate(`/issue/${issueId}`);
          return;
        }

        const tagIds = issue.tags && issue.tags.length > 0 ? issue.tags.map(t => t.id) : [];

        setFormData({
          title: issue.title,
          description: issue.description,
          status: issue.status,
        });

        setOriginalData({
          title: issue.title,
          description: issue.description,
          status: issue.status,
          tags: tagIds,
        });

        setSelectedTags(tagIds);
      } else {
        setError(response.error || '获取失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取失败');
    } finally {
      setLoading(false);
    }
  };

  const isTitleValid = formData.title.trim().length >= 5;
  const isDescriptionValid = formData.description.trim().length >= 10;
  const isFormValid = isTitleValid && isDescriptionValid;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const truncateText = (text: string, maxLength: number = 13): string => {
    // 移除所有换行符和多余空格，保持单行显示
    const singleLine = text.replace(/\s+/g, ' ').trim();
    if (singleLine.length <= maxLength) return singleLine;
    return singleLine.substring(0, maxLength) + '...';
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      open: '待处理',
      in_progress: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    };
    return statusMap[status] || status;
  };

  const generateChangeMessage = (): string | null => {
    const changes: string[] = [];

    // 检查标题变化
    if (formData.title !== originalData.title) {
      const oldTitle = truncateText(originalData.title);
      const newTitle = truncateText(formData.title);
      changes.push(`标题: ${oldTitle} -> ${newTitle}`);
    }

    // 检查标签变化
    const addedTags = selectedTags.filter(id => !originalData.tags.includes(id));
    const removedTags = originalData.tags.filter(id => !selectedTags.includes(id));

    if (addedTags.length > 0 || removedTags.length > 0) {
      const tagParts: string[] = [];

      if (addedTags.length > 0) {
        const addedTagNames = addedTags
          .map(id => allTags.find(t => t.id === id)?.name)
          .filter(Boolean)
          .join(', ');
        tagParts.push(`增加 ${addedTagNames}`);
      }

      if (removedTags.length > 0) {
        const removedTagNames = removedTags
          .map(id => allTags.find(t => t.id === id)?.name)
          .filter(Boolean)
          .join(', ');
        tagParts.push(`删除 ${removedTagNames}`);
      }

      changes.push(`标签: ${tagParts.join(' | ')}`);
    }

    // 检查描述变化
    if (formData.description !== originalData.description) {
      const oldDesc = truncateText(originalData.description);
      const newDesc = truncateText(formData.description);
      changes.push(`内容: ${oldDesc} -> ${newDesc}`);
    }

    // 检查状态变化
    if (formData.status !== originalData.status) {
      const oldStatus = getStatusLabel(originalData.status);
      const newStatus = getStatusLabel(formData.status);
      changes.push(`状态: ${oldStatus} -> ${newStatus}`);
    }

    if (changes.length === 0) {
      return null;
    }

    return `修改了Issue:  \n${changes.join('  \n')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && id) {
        const response = await issueService.updateIssue({
          id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          tags: selectedTags,
        });

        if (response.success) {
          // 生成变更消息并自动添加评论
          const changeMessage = generateChangeMessage();
          if (changeMessage) {
            await issueService.addComment({
              issue_id: id,
              message: changeMessage,
            });
          }

          navigate(`/issue/${id}`);
        } else {
          setError(response.error || '更新失败');
        }
      } else {
        const response = await issueService.createIssue({
          title: formData.title,
          description: formData.description,
          tags: selectedTags,
        });

        if (response.success && response.issue) {
          navigate(`/issue/${response.issue.id}`);
        } else {
          setError(response.error || '创建失败');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        pageKey={isEditMode ? 'issue-edit' : 'issue-create'}
        type="website"
        url={
          isEditMode
            ? `https://www.voidix.net/issue/edit/${id}`
            : 'https://www.voidix.net/issue/create'
        }
        canonicalUrl={
          isEditMode
            ? `https://www.voidix.net/issue/edit/${id}`
            : 'https://www.voidix.net/issue/create'
        }
        title={isEditMode ? '编辑 Issue' : '新建 Issue'}
      />

      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-10 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <BreadcrumbNavigation
              className="mb-6"
              items={[
                { label: '首页', href: '/' },
                { label: 'Issues', href: '/issue' },
                { label: isEditMode ? '编辑' : '新建', isCurrentPage: true },
              ]}
            />

            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => (isEditMode && id ? navigate(`/issue/${id}`) : navigate('/issue'))}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </button>
              <h1 className="text-xl font-semibold text-white">
                {isEditMode ? '编辑 Issue' : '新建 Issue'}
              </h1>
              <div className="w-16" />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 标题 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  标题 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="简明扼要地描述问题"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                  disabled={submitting}
                />
                {formData.title && !isTitleValid && (
                  <p className="text-xs text-red-400 mt-1.5">至少 5 个字符</p>
                )}
              </div>

              {/* 标签 */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">标签</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isSelected ? 'ring-1 ring-white/20' : 'opacity-50 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 描述 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  描述 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="详细描述你遇到的问题..."
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-y"
                  disabled={submitting}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-600">支持 Markdown</span>
                  {formData.description && !isDescriptionValid && (
                    <span className="text-xs text-red-400">至少 10 个字符</span>
                  )}
                </div>
              </div>

              {/* 状态（仅编辑模式且管理员） */}
              {isEditMode && isAdmin && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">状态</label>
                  <select
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-gray-600 transition-colors"
                    disabled={submitting}
                  >
                    <option value="open">待处理</option>
                    <option value="in_progress">处理中</option>
                    <option value="resolved">已解决</option>
                    <option value="closed">已关闭</option>
                  </select>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isFormValid || submitting}
                  className="flex-1"
                >
                  {submitting ? '提交中...' : isEditMode ? '保存' : '创建'}
                </Button>
                <Button
                  type="button"
                  onClick={() => (isEditMode && id ? navigate(`/issue/${id}`) : navigate('/issue'))}
                  variant="secondary"
                  size="lg"
                  disabled={submitting}
                >
                  取消
                </Button>
              </div>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default IssueFormPage;
