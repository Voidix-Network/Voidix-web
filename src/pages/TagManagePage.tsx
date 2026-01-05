import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { issueService } from '@/services/issueService';
import { AnimatedSection, BreadcrumbNavigation, Button, Card, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import { Plus, Edit2, Trash2, Palette, Check, X } from 'lucide-react';
import { Tag } from '@/types/api';

/**
 * Tag管理页面（仅管理员）
 */
export const TagManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, validateToken } = useAuthStore();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 编辑模式
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
  });

  // 页面加载 - 使用ref避免无限循环
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      await validateToken();

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!user?.isAdmin) {
        navigate('/issue');
        return;
      }

      await loadTags();
      setIsInitialized(true);
    };

    init();
  }, [isInitialized]); // 只依赖isInitialized

  // 加载所有Tag
  const loadTags = async () => {
    try {
      setError(null);

      const response = await issueService.getTags();

      if (response.success && response.tags) {
        setTags(response.tags);
      } else {
        setError(response.error || '获取标签失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取标签失败');
    }
  };

  // 创建/更新Tag
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('标签名称不能为空');
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      let response;
      if (editingTag) {
        // 更新
        response = await issueService.updateTag(
          editingTag.id,
          formData.name.trim(),
          formData.color
        );
      } else {
        // 创建
        response = await issueService.createTag(formData.name.trim(), formData.color);
      }

      if (response.success) {
        setSuccess(editingTag ? '标签更新成功！' : '标签创建成功！');
        setEditingTag(null);
        setFormData({ name: '', color: '#3b82f6' });
        await loadTags();
      } else {
        setError(response.error || '操作失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  // 删除Tag
  const handleDelete = async (tag: Tag) => {
    if (!confirm(`确定要删除标签 "${tag.name}" 吗？`)) {
      return;
    }

    try {
      const response = await issueService.deleteTag(tag.id);

      if (response.success) {
        setSuccess('标签删除成功！');
        await loadTags();
      } else {
        setError(response.error || '删除失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 开始编辑
  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '#3b82f6' });
    setError(null);
  };

  // 颜色选择器选项
  const presetColors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#64748b',
    '#94a3b8',
  ];

  if (loading && !isInitialized) {
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
        pageKey="tag-manage"
        type="website"
        url="https://www.voidix.net/tag-manage"
        canonicalUrl="https://www.voidix.net/tag-manage"
        title="标签管理"
      />

      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* 面包屑导航 */}
            <BreadcrumbNavigation
              className="mb-8"
              items={[
                { label: '首页', href: '/' },
                { label: 'Issue系统', href: '/issue' },
                { label: '标签管理', isCurrentPage: true },
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
                <GradientText variant="primary">标签管理</GradientText>
              </motion.h1>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Button
                  onClick={() => {
                    cancelEdit();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  variant="primary"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  新建标签
                </Button>
              </motion.div>
            </motion.div>

            {/* 消息提示 */}
            {error && (
              <motion.div
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-red-300">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-green-300">{success}</p>
              </motion.div>
            )}

            {/* 表单区域 */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Palette className="h-6 w-6 text-blue-400" />
                {editingTag ? '编辑标签' : '创建新标签'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 标签名称 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    标签名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="输入标签名称"
                    required
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500">最多50个字符</p>
                </div>

                {/* 颜色选择 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">标签颜色</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-gray-600"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono"
                      placeholder="#3b82f6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>

                  {/* 预设颜色 */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {presetColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-white transition-all"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" size="md">
                    {editingTag ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        更新标签
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        创建标签
                      </>
                    )}
                  </Button>

                  {editingTag && (
                    <Button type="button" onClick={cancelEdit} variant="outline" size="md">
                      <X className="h-4 w-4 mr-2" />
                      取消编辑
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>

            {/* 标签列表 */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-6">标签列表 ({tags.length})</h2>

              {tags.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">暂无标签</p>
                  <p className="text-gray-500 text-sm mt-2">点击上方"新建标签"按钮创建</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {tags.map(tag => (
                      <motion.div
                        key={tag.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          variant="glass"
                          className={`p-4 border-l-4 ${editingTag?.id === tag.id ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: tag.color }}
                                />
                                <span className="font-semibold text-white">{tag.name}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-mono">{tag.color}</p>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                onClick={() => startEdit(tag)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:bg-blue-900/20"
                                title="编辑"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(tag)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:bg-red-900/20"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* 返回按钮 */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button onClick={() => navigate('/issue')} variant="secondary" size="md">
                返回Issue系统
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default TagManagePage;
