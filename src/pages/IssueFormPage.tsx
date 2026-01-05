import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { issueService } from '@/services/issueService';
import { AnimatedSection, BreadcrumbNavigation, Button, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import { AlertCircle, CheckCircle, Tag as TagIcon, Plus } from 'lucide-react';
import { Tag } from '@/types/api';


/**
 * Issue创建/编辑表单页面
 */
export const IssueFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, validateToken, user } = useAuthStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
  });

  // Tag相关
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // 权限检查
  const isAdmin = user?.isAdmin || false;

  // 表单验证状态
  const [touched, setTouched] = useState({
    title: false,
    description: false,
  });

  // 页面加载时验证token
  useEffect(() => {
    const init = async () => {
      await validateToken();

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      // 加载所有标签
      await loadAllTags();

      // 如果有id，进入编辑模式
      if (id) {
        setIsEditMode(true);
        await loadIssue(id);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [validateToken, isAuthenticated, navigate, id]);

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

  // 加载issue数据（编辑模式）
  const loadIssue = async (issueId: string) => {
    try {
      const response = await issueService.getIssue(issueId);

      if (response.success && response.issue) {
        const issue = response.issue;

        // 权限检查：只有作者或管理员可以编辑
        if (user && issue.author_uuid !== user.player_uuid && !user.isAdmin) {
          setError('您没有权限编辑此issue');
          navigate(`/issue/${issueId}`);
          return;
        }

        setFormData({
          title: issue.title,
          description: issue.description,
          status: issue.status,
        });

        // 加载已选标签
        if (issue.tags && issue.tags.length > 0) {
          setSelectedTags(issue.tags.map(t => t.id));
        }
      } else {
        setError(response.error || '获取issue失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取issue失败');
    } finally {
      setLoading(false);
    }
  };

  // 验证
  const validateTitle = (value: string) => value.trim().length >= 5;
  const validateDescription = (value: string) => value.trim().length >= 10;

  const isTitleValid = validateTitle(formData.title);
  const isDescriptionValid = validateDescription(formData.description);
  const isFormValid = isTitleValid && isDescriptionValid;

  const handleBlur = (field: 'title' | 'description') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  // Tag选择/取消选择
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode && id) {
        // 编辑模式
        const response = await issueService.updateIssue({
          id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          tags: selectedTags,
        });

        if (response.success) {
          setSuccess('Issue更新成功！');
          setTimeout(() => {
            navigate(`/issue/${id}`);
          }, 1000);
        } else {
          setError(response.error || '更新失败');
        }
      } else {
        // 创建模式
        const response = await issueService.createIssue({
          title: formData.title,
          description: formData.description,
          tags: selectedTags,
        });

        if (response.success && response.issue) {
          setSuccess('Issue创建成功！');
          setTimeout(() => {
            navigate(`/issue/${response.issue!.id}`);
          }, 1000);
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

  // 取消
  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/issue/${id}`);
    } else {
      navigate('/issue');
    }
  };

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

  return (
    <>
      <SEO
        pageKey={isEditMode ? 'issue-edit' : 'issue-create'}
        type="website"
        url={isEditMode ? `https://www.voidix.net/issue/edit/${id}` : 'https://www.voidix.net/issue/create'}
        canonicalUrl={isEditMode ? `https://www.voidix.net/issue/edit/${id}` : 'https://www.voidix.net/issue/create'}
        title={isEditMode ? '编辑Issue' : '创建Issue'}
      />

      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* 面包屑导航 */}
            <BreadcrumbNavigation
              className="mb-8"
              items={[
                { label: '首页', href: '/' },
                { label: 'Issue系统', href: '/issue' },
                { label: isEditMode ? '编辑' : '创建', isCurrentPage: true },
              ]}
            />

            {/* 页面标题 */}
            <motion.div
              className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.h1
                className="text-4xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <GradientText variant="primary">
                  {isEditMode ? '编辑 Issue' : '创建新 Issue'}
                </GradientText>
              </motion.h1>

              {/* 管理员标签管理按钮 */}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button
                    onClick={() => navigate('/tag-manage')}
                    variant="secondary"
                    size="md"
                  >
                    <TagIcon className="h-4 w-4 mr-2" />
                    管理标签
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* 消息提示 */}
            {error && (
              <motion.div
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-300">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6 flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-300">{success}</span>
              </motion.div>
            )}

            {/* 表单 */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 标题输入 */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    标题 <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    onBlur={() => handleBlur('title')}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      touched.title && !isTitleValid
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                    } text-white placeholder-gray-500`}
                    placeholder="简明扼要地描述问题"
                    disabled={submitting}
                  />
                  {touched.title && !isTitleValid && (
                    <p className="text-red-400 text-xs">标题至少需要5个字符</p>
                  )}
                  {touched.title && isTitleValid && (
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      标题格式正确
                    </p>
                  )}
                </motion.div>

                {/* 标签选择 */}
                {allTags.length > 0 && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      标签（可选，可多选）
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
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
                            {isSelected && <Plus className="h-3 w-3 inline mr-1 transform rotate-45" />}
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                    {selectedTags.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        已选择 {selectedTags.length} 个标签
                      </p>
                    )}
                  </motion.div>
                )}

                {/* 描述输入 */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    详细描述 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    rows={8}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y ${
                      touched.description && !isDescriptionValid
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                    } text-white placeholder-gray-500`}
                    placeholder="请详细描述您遇到的问题，支持Markdown语法：
- 问题发生的步骤
- 期望的结果
- 实际的结果
- **粗体**、*斜体*、`代码`等"
                    disabled={submitting}
                  />
                  {touched.description && !isDescriptionValid && (
                    <p className="text-red-400 text-xs">描述至少需要10个字符</p>
                  )}
                  {touched.description && isDescriptionValid && (
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      描述格式正确
                    </p>
                  )}
                  <p className="text-xs text-gray-500">支持Markdown语法</p>
                </motion.div>

                {/* 状态选择（仅编辑模式且有权限时显示） */}
                {isEditMode && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                      状态 {isAdmin && <span className="text-purple-400 text-xs">(管理员可修改任意状态)</span>}
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      disabled={submitting}
                    >
                      <option value="open">开放</option>
                      <option value="in_progress">进行中</option>
                      <option value="resolved">已解决</option>
                      <option value="closed">已关闭</option>
                    </select>
                    {!isAdmin && (
                      <p className="text-yellow-400 text-xs">
                        注意：作为作者，您只能将状态修改为"已关闭"
                      </p>
                    )}
                  </motion.div>
                )}

                {/* 按钮组 */}
                <motion.div
                  className="flex gap-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submitting}
                    disabled={!isFormValid || submitting}
                    className="flex-1"
                  >
                    {submitting ? (isEditMode ? '更新中...' : '创建中...') : (isEditMode ? '更新 Issue' : '创建 Issue')}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    size="lg"
                    disabled={submitting}
                    className="px-6"
                  >
                    取消
                  </Button>
                </motion.div>

                {/* 必填项说明 */}
                <motion.div
                  className="text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p><span className="text-red-400">*</span> 为必填项</p>
                </motion.div>
              </form>
            </motion.div>

            {/* 帮助信息 */}
            <motion.div
              className="mt-8 bg-gray-800/30 border border-gray-700 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">提交前请确认</h3>
              <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                <li>标题简洁明了，能准确描述问题</li>
                <li>描述包含重现问题的详细步骤</li>
                <li>选择合适的标签帮助分类</li>
                <li>已搜索是否已有类似的问题</li>
                <li>提供相关的错误信息或截图链接（如有）</li>
              </ul>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default IssueFormPage;
