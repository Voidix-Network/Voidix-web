import { Link } from 'react-router-dom';

/**
 * 法律链接部分组件
 * 显示隐私政策、服务条款等法律相关链接
 */
export const LegalLinksSection: React.FC = () => {
  return (
    <div>
      <h3 className="font-semibold mb-6 text-lg">法律信息</h3>
      <ul className="space-y-3">
        <li>
          <Link
            to="/privacy"
            className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-3 group"
          >
            <span>隐私政策</span>
            <svg
              className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </li>
        <li>
          <Link
            to="/terms"
            className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-3 group"
          >
            <span>服务条款</span>
            <svg
              className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </li>
      </ul>
    </div>
  );
};
