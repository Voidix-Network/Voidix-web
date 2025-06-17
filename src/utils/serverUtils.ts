// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\utils\serverUtils.ts
import type { ServerGroupStats } from '@/constants/serverGroups';

/**
 * 计算服务器组统计信息
 * @param groupServers 服务器组中的服务器ID列表
 * @param servers 所有服务器数据
 * @returns 服务器组统计信息
 */
export const calculateGroupStats = (groupServers: string[], servers: any): ServerGroupStats => {
  let totalPlayers = 0;
  let onlineServers = 0;
  let totalServers = 0;

  groupServers.forEach(serverId => {
    const serverData = servers[serverId];
    if (serverData) {
      totalServers++;
      totalPlayers += serverData.players || 0;
      if (serverData.isOnline) {
        onlineServers++;
      }
    }
  });

  // 确定组的整体状态
  let status: 'online' | 'offline' | 'partial' = 'offline';
  if (onlineServers === totalServers && totalServers > 0) {
    status = 'online';
  } else if (onlineServers > 0) {
    status = 'partial';
  }

  return {
    totalPlayers,
    onlineServers,
    totalServers,
    status,
  };
};

/**
 * 复制到剪贴板的工具函数
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};
