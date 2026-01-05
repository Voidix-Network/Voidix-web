/**
 * 社区链接部分组件
 * 显示QQ群、Discord、GitHub等社区链接
 * 优化以防止布局偏移 (CLS)
 */
export const CommunityLinksSection: React.FC = () => {
  return (
    <div className="min-h-[200px]">
      <h3 className="font-semibold mb-6 text-lg">社区链接</h3>
      <ul className="space-y-3">
        <li>
          <a
            href="https://qm.qq.com/cgi-bin/qm/qr?k=aMRoacVuxcGVSzEwfjb49oN4CWCv6yHj&jump_from=webapi&authKey=hw0EhRKGDGN1vmHD4AfK2yJCzPzSA+AXGJOEcugZpsA7KfK9GhNXpe9GNWCjCcmr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-3 group h-8"
          >
            <span>QQ群</span>
            <svg
              className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>
        <li>
          <a
            href="https://discord.gg/fUMyfhuQ5b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-3 group h-8"
          >
            <span>Discord</span>
            <svg
              className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/Voidix-Network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-3 group h-8"
          >
            <span>GitHub</span>
            <svg
              className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>
      </ul>
    </div>
  );
};
