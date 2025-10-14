import { GradientText } from '@/components';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageCircle, TrendingUp } from 'lucide-react';
import React, { UIEvent, useCallback, useEffect, useRef, useState } from 'react';

/**
 * WebSocket消息类型定义
 */
interface PlayerChatEvent {
  type: 'event_call';
  event_id: 'player_chat';
  timestamp: number;
  event_data: {
    name: string;
    uuid: string;
    on_server: string;
    message: string;
    privacy_level: string;
  };
}
type ChatMessage = {
  id: string;
  type: 'chat' | 'join' | 'quit';
  playerName: string;
  message?: string;
  server?: string;
  timestamp: number;
  privacyLevel: string;
  uuid: string;
};

// 管理成员UUID列表
const ADMIN_UUIDS = [
  '6fee67b8-4e11-469a-95e2-b689145bf8a0',
  '520e26b3-1a35-42ec-ab4f-9c6eeacaa96e',
  'c068d6d5-5104-4e60-9914-9263e55dae52',
  'd92297fc-ac30-4023-a0ea-bd0deed0e5a2',
];

/**
 * 聊天消息组件
 */
const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isAdmin = ADMIN_UUIDS.includes(message.uuid);

  const getMessageContent = () => {
    if (message.privacyLevel === 'hidden') {
      return (
        <p className="text-sm text-gray-500 italic break-words">
          &lt;该玩家的隐私设置不允许在网站上查看消息&gt;
        </p>
      );
    }
    return <p className="text-sm text-gray-300 break-words">{message.message}</p>;
  };

  const getPlayerNameStyle = () => {
    if (isAdmin) {
      return 'text-sm font-semibold text-red-400';
    }
    return 'text-sm font-semibold text-blue-400';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-3 rounded-lg bg-[#151b2d]/80 border border-[#2a365c]/70 ${
        message.privacyLevel === 'hidden' ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isAdmin
              ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
              : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
          }`}
        >
          <span className={`text-xs font-bold ${isAdmin ? 'text-red-400' : 'text-blue-400'}`}>
            {message.playerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className={getPlayerNameStyle()}>
              {message.playerName}
              {isAdmin && <span className="ml-1 text-xs text-red-300">[管理]</span>}
            </span>
            {message.server && <span className="text-xs text-gray-500">@{message.server}</span>}
            <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
            {message.privacyLevel === 'hidden' && (
              <span className="text-xs text-yellow-500">[隐私]</span>
            )}
          </div>
          {getMessageContent()}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 实时聊天展示组件
 */
export const LiveChatSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // 使用 useCallback 避免重复创建函数
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current && isMountedRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setShowNewMessageIndicator(false);
    }
  }, []);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (!isMountedRef.current) return;

    const container = event.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 5;
    if (isAtBottom) {
      setShowNewMessageIndicator(false);
    }
  }, []);

  // WebSocket连接和消息处理
  useEffect(() => {
    isMountedRef.current = true;

    const connectWebSocket = () => {
      // 检查组件是否已卸载
      if (!isMountedRef.current) return;

      try {
        const ws = new WebSocket('wss://api.voidix.top:10203');
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMountedRef.current) {
            ws.close();
            return;
          }
          setIsConnected(true);
          ws.send(
            JSON.stringify({
              type: 'subscribe_event',
              action: 'batch_subscribe',
              event_ids: ['player_chat'],
            })
          );
        };

        ws.onmessage = event => {
          if (!isMountedRef.current) return;

          try {
            const data = JSON.parse(event.data);
            if (data.type === 'event_call' && data.event_id === 'player_chat') {
              const chatEvent = data as PlayerChatEvent;

              setMessages(prev => {
                // 检查重复消息
                const isDuplicate = prev.some(
                  msg =>
                    msg.playerName === chatEvent.event_data.name &&
                    msg.message === chatEvent.event_data.message &&
                    msg.timestamp === chatEvent.timestamp
                );
                if (isDuplicate) return prev;

                const container = chatContainerRef.current;
                const isScrolledUp = container
                  ? container.scrollHeight - container.scrollTop > container.clientHeight + 100
                  : false;

                if (isScrolledUp) {
                  setShowNewMessageIndicator(true);
                } else {
                  // 使用 requestAnimationFrame 确保在下一帧执行
                  requestAnimationFrame(() => {
                    if (isMountedRef.current) {
                      scrollToBottom();
                    }
                  });
                }

                const newMessage: ChatMessage = {
                  id: `${chatEvent.timestamp}-${chatEvent.event_data.uuid}`,
                  type: 'chat',
                  playerName: chatEvent.event_data.name,
                  message: chatEvent.event_data.message,
                  server: chatEvent.event_data.on_server,
                  timestamp: chatEvent.timestamp,
                  privacyLevel: chatEvent.event_data.privacy_level,
                  uuid: chatEvent.event_data.uuid,
                };
                return [...prev, newMessage].slice(-30);
              });

              setMessageCount(prev => prev + 1);
            }
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        ws.onerror = () => {
          if (isMountedRef.current) {
            setIsConnected(false);
          }
        };

        ws.onclose = () => {
          if (isMountedRef.current) {
            setIsConnected(false);
            // 只有在组件仍挂载时才重连
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
          }
        };
      } catch (error) {
        console.error('WebSocket连接失败:', error);
        if (isMountedRef.current) {
          setIsConnected(false);
        }
      }
    };

    connectWebSocket();

    // 清理函数 - 修复内存泄漏
    return () => {
      isMountedRef.current = false;

      // 清除重连定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // 关闭WebSocket连接
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, 'Component unmounted');
        }
        wsRef.current = null;
      }

      // 清理状态
      setMessages([]);
      setMessageCount(0);
      setShowNewMessageIndicator(false);
    };
  }, [scrollToBottom]);

  return (
    <section className="mb-32" id="live-chat">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* 左侧聊天框 */}
          <div className="md:w-1/2 relative w-full order-2 md:order-1">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-600 rounded-full filter blur-3xl opacity-20"></div>
            <div className="relative bg-[#1a1f2e]/50 border border-[#2a365c] rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-[#151b2d]/80 border-b border-[#2a365c]/70 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">实时聊天</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
                  ></div>
                  <span className="text-xs text-gray-400">
                    {isConnected ? '已连接' : '连接中...'}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className="h-96 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm">等待玩家聊天消息...</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {messages.map(msg => (
                        <ChatMessageItem key={msg.id} message={msg} />
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                <AnimatePresence>
                  {showNewMessageIndicator && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={scrollToBottom}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"
                    >
                      <motion.div
                        animate={{
                          translateY: [0, -2, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </motion.div>
                      有新消息
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-[#151b2d]/80 border-t border-[#2a365c]/70 p-3">
                <p className="text-xs text-gray-500 text-center">
                  聊天信息均来自游戏内玩家，如发现不良言论请通过渠道反馈
                </p>
              </div>
            </div>
          </div>
          {/* 右侧内容 */}
          <div className="md:w-1/2 order-1 md:order-2">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                感受
                <span className="ml-2">
                  <GradientText variant="primary">社区活力</GradientText>
                </span>
              </h2>
              <p className="text-gray-400 mb-6">
                实时查看服务器内玩家的聊天互动，体验Voidix活跃的社区氛围。所有消息都来自正在游戏中的玩家，展现着这个公益服务器的真实面貌。
              </p>
              <div className="hidden sm:grid grid-cols-2 gap-3 mt-6">
                <div className="px-4 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c] hover:bg-[#1f2538]/60 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <div className="text-xs text-gray-400">实时消息</div>
                  </div>
                  <div className="text-base font-bold text-white">{messageCount} 条</div>
                </div>
                <div className="px-4 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c] hover:bg-[#1f2538]/60 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-purple-400" />
                    <div className="text-xs text-gray-400">连接状态</div>
                  </div>
                  <div
                    className={`text-base font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {isConnected ? '在线' : '离线'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
