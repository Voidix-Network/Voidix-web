import React, { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * 分页组件
 * 提供页面导航功能，支持快速跳转
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasMore,
  isLoading,
  onPageChange,
  onPrevious,
  onNext,
  className = '',
}) => {
  const [inputPage, setInputPage] = useState('');

  // 生成页面按钮数组
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 最多显示5个页面按钮

    if (totalPages <= maxVisible) {
      // 如果总页数不多，显示所有页面
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 如果页面很多，智能显示
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // 显示当前页前后的页面
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // 处理页码输入跳转
  const handlePageJump = () => {
    const page = parseInt(inputPage);
    if (!isNaN(page) && page > 0) {
      onPageChange(page);
      setInputPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* 上一页按钮 */}
      <button
        onClick={onPrevious}
        disabled={currentPage <= 1 || isLoading}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${
            currentPage <= 1 || isLoading
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }
        `}
        title="上一页"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        上一页
      </button>

      {/* 页面按钮 */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isCurrentPage
                    ? 'bg-blue-600 text-white'
                    : isLoading
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }
              `}
              title={`第 ${pageNum} 页`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 下一页按钮 */}
      <button
        onClick={onNext}
        disabled={!hasMore || isLoading}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${
            !hasMore || isLoading
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }
        `}
        title="下一页"
      >
        下一页
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 页面信息 */}
      <div className="ml-4 text-xs text-gray-500">
        第 {currentPage} 页{totalPages > 1 && ` / 共 ${hasMore ? `${totalPages}+` : totalPages} 页`}
      </div>

      {/* 快速跳转 */}
      {totalPages > 3 && (
        <div className="ml-4 flex items-center space-x-2">
          <span className="text-xs text-gray-500">跳转到</span>
          <input
            type="number"
            min="1"
            max={hasMore ? undefined : totalPages}
            value={inputPage}
            onChange={e => setInputPage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="页码"
            disabled={isLoading}
            className="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handlePageJump}
            disabled={isLoading || !inputPage}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            跳转
          </button>
        </div>
      )}
    </div>
  );
};
