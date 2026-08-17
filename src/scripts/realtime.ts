export {};

type Player = { name: string; uuid: string; server: string | null };
type Server = {
  id: string;
  name: string;
  online: boolean;
  players: Player[];
  playersCount: number;
  implementing: boolean;
  version?: string;
  error?: string;
};
type Node = { id: string; name: string; type: 'CATEGORY' | 'SERVER'; children?: Node[]; extra?: { status?: string } };

const socketUrl = 'wss://api.voidix.net:10203';
const root = document.querySelector('[data-realtime]');
let socket: WebSocket | undefined;
let requestId = 0;
let timer: number | undefined;
let reconnectTimer: number | undefined;
let servers = new Map<string, Server>();
let serverTree: Node[] = [];
let running = { current: 0, total: 0 };
const pending = new Map<string, { resolve: (value: any) => void; reject: () => void; timeout: number }>();

const all = <T extends Element>(selector: string) => [...document.querySelectorAll<T>(selector)];
const write = (selector: string, value: string) =>
  all<HTMLElement>(selector).forEach((node) => (node.textContent = value));
function setConnectionDependentContent(connected: boolean) {
  all<HTMLElement>('[data-total-players], [data-current-uptime], [data-total-uptime]').forEach((node) => {
    node.classList.toggle('text-red-400', !connected);
    node.classList.toggle('text-white', connected);
  });
  if (!connected) {
    write('[data-total-players]', '连接失败');
    write('[data-current-uptime]', '连接失败');
    write('[data-total-uptime]', '连接失败');
    write('[data-minigame-summary]', '连接失败');
    all<HTMLElement>('[data-minigame-summary]').forEach((node) => {
      node.className =
        'min-w-[70px] flex-shrink-0 whitespace-nowrap text-right font-mono text-sm font-semibold text-red-400 md:text-base';
    });
    all<HTMLElement>('[data-minigame-about-dot]').forEach(
      (node) => (node.className = 'h-4 w-4 flex-shrink-0 rounded-full bg-red-500'),
    );
    all<HTMLElement>('[data-survival-summary]').forEach((node) => {
      node.textContent = '连接失败';
      node.className =
        'min-w-[70px] flex-shrink-0 whitespace-nowrap text-right font-mono text-sm font-semibold text-red-400 md:text-base';
    });
  }
}
const dotClass = (kind: 'online' | 'warn' | 'bad' | 'neutral') =>
  `rounded-full ${kind === 'online' ? 'bg-green-500' : kind === 'warn' ? 'bg-yellow-500 animate-pulse' : kind === 'bad' ? 'bg-red-500' : 'bg-gray-400'}`;
const footerDotClass = (kind: 'online' | 'warn' | 'bad' | 'neutral') =>
  `h-4 w-4 flex-shrink-0 rounded-full ${kind === 'online' ? 'bg-green-400 shadow-lg shadow-green-400/30' : kind === 'warn' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse' : kind === 'bad' ? 'bg-red-400 shadow-lg shadow-red-400/30' : 'bg-gray-400 shadow-lg shadow-gray-400/30'}`;
function setFooterLoading(loading: boolean) {
  all<HTMLElement>('[data-footer-skeleton]').forEach((node) => (node.style.display = loading ? 'flex' : 'none'));
  all<HTMLElement>('[data-footer-content]').forEach((node) => (node.style.display = loading ? 'none' : 'flex'));
}
const state = (text: string, kind: 'online' | 'warn' | 'bad' | 'neutral' = 'neutral') => {
  setConnectionDependentContent(kind === 'online');
  write('[data-connection-text]', text);
  all<HTMLElement>('[data-connection-dot]').forEach((dot) => (dot.className = `h-2 w-2 ${dotClass(kind)}`));
  const footerDot = document.querySelector<HTMLElement>('[data-footer-dot]');
  if (footerDot) footerDot.className = footerDotClass(kind);
  const footerText = kind === 'online' ? '正常运行' : text;
  all<HTMLElement>('[data-footer-status]').forEach((node) => {
    node.className = `text-sm font-medium ${kind === 'online' ? 'text-green-400' : kind === 'warn' ? 'text-yellow-400' : kind === 'bad' ? 'text-red-400' : 'text-gray-400'}`;
    node.textContent = `服务器状态: ${footerText}`;
  });
  setFooterLoading(kind === 'neutral' && text === '连接中...');
};

function format(seconds: number) {
  if (!seconds || seconds < 0) return '0分';
  const minute = 60,
    hour = 3600,
    day = 86400,
    year = day * 365;
  if (seconds >= year) return `${Math.floor(seconds / year)}年 ${Math.floor((seconds % year) / day)}天`;
  if (seconds >= 100 * day) return `${Math.floor(seconds / day)}天`;
  if (seconds >= day) return `${Math.floor(seconds / day)}天 ${Math.floor((seconds % day) / hour)}时`;
  if (seconds >= hour) return `${Math.floor(seconds / hour)}时 ${Math.floor((seconds % hour) / minute)}分`;
  return `${Math.max(0, Math.floor(seconds / minute))}分`;
}

function request(method: string, params = {}) {
  return new Promise<any>((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return reject();
    const id = `r${++requestId}`;
    const timeout = window.setTimeout(() => {
      pending.delete(id);
      reject();
    }, 10000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function collect(node: any, playerList: Player[], statusMap: Record<string, any>): Node {
  const raw = node as {
    id: string;
    friendlyName?: string;
    type: string;
    children?: any[];
    extra?: { status?: string };
  };
  if (raw.type === 'SERVER') {
    const status = statusMap[raw.id] || {};
    servers.set(raw.id, {
      id: raw.id,
      name: raw.friendlyName || raw.id,
      online: Boolean(status.online),
      players: playerList.filter((player) => player.server === raw.id),
      playersCount: status.players?.online || 0,
      implementing: raw.extra?.status === 'implementing',
      version: status.version?.name,
      error: status.error,
      extra: raw.extra,
    } as Server & { extra?: { status?: string } });
  }
  return {
    id: raw.id,
    name: raw.friendlyName || raw.id,
    type: raw.type === 'CATEGORY' ? 'CATEGORY' : 'SERVER',
    children: raw.children?.map((child) => collect(child, playerList, statusMap)),
    extra: raw.extra,
  };
}

function aggregate(node: Node) {
  const leaves: Server[] = [];
  const walk = (entry: Node) => {
    if (entry.type === 'SERVER') {
      const server = servers.get(entry.id);
      if (server) leaves.push(server);
    } else entry.children?.forEach(walk);
  };
  walk(node);
  return {
    leaves,
    online: leaves.filter((server) => server.online).length,
    players: leaves.reduce((count, server) => count + server.playersCount, 0),
  };
}

function playerHtml(player: Player, index: number) {
  const avatar = `https://minotar.net/avatar/${encodeURIComponent(player.uuid)}`;
  const premium = player.uuid?.split('-')[2]?.[0] === '4';
  return `<div class="player-card relative flex items-center space-x-2 rounded bg-gray-700 px-3 py-2 text-sm text-gray-300 transition-all duration-200 hover:scale-105 hover:bg-gray-600" style="animation:fadeInUp .3s ease-out ${index * 0.05}s both"><div class="relative"><img src="${avatar}" alt="${escapeHtml(player.name)}" width="16" height="16" loading="lazy" class="h-4 w-4 rounded-sm" data-player-avatar>${premium ? '<span class="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-gray-800 bg-green-500" title="正版玩家"></span>' : ''}</div><span class="font-medium">${escapeHtml(player.name)}</span></div>`;
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char,
  );
}
function serverHtml(server: Server) {
  const status = server.implementing ? '施工中' : server.online ? '在线' : '离线';
  const dot = server.implementing
    ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse'
    : server.online
      ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse'
      : 'bg-red-500 shadow-lg shadow-red-500/50';
  const playerButton =
    server.online && server.players.length
      ? `<button type="button" class="text-sm text-blue-400 transition-all duration-200 hover:scale-105 hover:text-blue-300" data-toggle-players>查看列表</button>`
      : '';
  const players = server.players.length
    ? `<div class="max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-in-out" data-player-panel><div class="border-t border-gray-700 pt-4"><h4 class="mb-2 text-sm font-medium text-gray-400">在线玩家：</h4><div class="grid grid-cols-2 gap-2 md:grid-cols-3">${server.players.map(playerHtml).join('')}</div></div></div>`
    : '';
  const error =
    !server.online && server.error
      ? `<div class="mt-3 rounded border border-red-800 bg-red-900/20 p-2"><p class="text-xs text-red-400">${escapeHtml(server.error)}</p></div>`
      : '';
  return `<article class="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/50"><div class="p-4"><div class="flex items-center justify-between"><div class="flex items-center space-x-3"><i class="h-3 w-3 rounded-full transition-all duration-300 ${dot}"></i><div><h3 class="font-semibold text-white">${escapeHtml(server.name)}</h3><p class="text-sm text-gray-400">${status}${server.version ? ` • ${escapeHtml(server.version)}` : ''}</p></div></div><div class="text-right">${server.online && !server.implementing ? `<p class="font-semibold text-white">${server.playersCount} 玩家</p>` : ''}${playerButton}</div></div>${players}${error}</div></article>`;
}
function groupHtml(node: Node): string {
  const info = aggregate(node);
  const children = node.children || [];
  return `<article class="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/30"><button type="button" class="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-all duration-200 hover:bg-gray-750" data-toggle-group><span class="flex items-center space-x-3"><svg class="h-5 w-5 text-gray-400 transition-all duration-300 ease-out" data-group-chevron viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg><span><b class="block text-lg font-bold text-white">${escapeHtml(node.name)}</b><small class="text-sm text-gray-400">${info.online}/${info.leaves.length} 服务器在线</small></span></span><span class="text-right"><b class="block text-lg font-semibold text-white">${info.players} 玩家</b><small class="text-sm text-gray-400">${info.online}/${info.leaves.length} 服务器在线</small></span></button><div class="max-h-0 overflow-hidden border-t border-gray-700 bg-gray-850 opacity-0 transition-all duration-500 ease-in-out" data-group-panel><div class="space-y-3 p-4">${children.map((child) => (child.type === 'CATEGORY' ? groupHtml(child) : serverHtml(servers.get(child.id)!))).join('')}</div></div></article>`;
}

function bindStatusInteractions() {
  document.querySelectorAll<HTMLElement>('[data-toggle-players]').forEach((button) =>
    button.addEventListener('click', () => {
      const card = button.closest('article');
      const panel = card?.querySelector<HTMLElement>(':scope > div > [data-player-panel]');
      if (!panel) return;
      const open = panel.classList.contains('max-h-96');
      panel.classList.toggle('max-h-96', !open);
      panel.classList.toggle('max-h-0', open);
      panel.classList.toggle('opacity-100', !open);
      panel.classList.toggle('opacity-0', open);
      panel.classList.toggle('mt-4', !open);
      button.textContent = open ? '查看列表' : '隐藏列表';
    }),
  );
  document.querySelectorAll<HTMLElement>('[data-toggle-group]').forEach((button) =>
    button.addEventListener('click', () => {
      const card = button.closest('article');
      const panel = card?.querySelector<HTMLElement>(':scope > [data-group-panel]');
      const chevron = button.querySelector<HTMLElement>('[data-group-chevron]');
      if (!panel) return;
      const open = panel.classList.contains('max-h-[2000px]');
      panel.classList.toggle('max-h-[2000px]', !open);
      panel.classList.toggle('max-h-0', open);
      panel.classList.toggle('opacity-100', !open);
      panel.classList.toggle('opacity-0', open);
      chevron?.classList.toggle('rotate-90', !open);
      chevron?.classList.toggle('text-blue-400', !open);
    }),
  );
  document.querySelectorAll<HTMLImageElement>('[data-player-avatar]').forEach((image) =>
    image.addEventListener(
      'error',
      () => {
        image.src =
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Crect fill="%234a5568" width="16" height="16"/%3E%3C/svg%3E';
      },
      { once: true },
    ),
  );
}

function render() {
  const list = [...servers.values()];
  const totalPlayers = list.reduce((count, server) => count + server.playersCount, 0);
  const online = list.filter((server) => server.online).length;
  const minigame = list.filter((server) =>
    [
      'bedwars',
      'bedwars_solo',
      'bedwars_other',
      'knockioffa',
      'buildbattle',
      'thepit',
      'murdermystery',
      'skywars',
      'thebridge',
    ].includes(server.id),
  );
  const minigamePlayers = minigame.reduce((count, server) => count + server.playersCount, 0);
  const minigameOnline = minigame.some((server) => server.online) || Boolean(servers.get('login')?.online);
  write('[data-total-players]', `${totalPlayers}人`);
  write('[data-current-uptime]', format(running.current));
  write('[data-total-uptime]', format(running.total));
  all<HTMLElement>('[data-minigame-status]').forEach((node) => {
    node.className = 'text-sm font-semibold text-green-400';
    node.textContent = `${minigamePlayers} 在线`;
  });
  write('[data-minigame-summary]', `${minigamePlayers} 在线`);
  all<HTMLElement>('[data-minigame-hero-dot]').forEach((dot) => {
    dot.className = 'h-3 w-3 rounded-full bg-green-400 animate-pulse';
  });
  all<HTMLElement>('[data-minigame-about-dot]').forEach((dot) => {
    dot.className = `h-4 w-4 flex-shrink-0 rounded-full ${minigameOnline ? 'bg-green-500' : 'bg-red-500'}`;
  });
  all<HTMLElement>('[data-minigame-summary]').forEach((node) => {
    node.className = `min-w-[70px] flex-shrink-0 whitespace-nowrap text-right font-mono text-sm font-semibold md:text-base ${minigameOnline ? 'text-blue-400' : 'text-red-400'}`;
  });
  all<HTMLElement>('[data-survival-summary]').forEach((node) => {
    node.textContent = '维护中';
    node.className =
      'min-w-[70px] flex-shrink-0 whitespace-nowrap text-right font-mono text-sm font-semibold text-yellow-400 md:text-base';
  });
  write('[data-footer-players]', String(totalPlayers));
  write('[data-footer-updated]', new Date().toLocaleString('zh-CN'));
  write('[data-stat-total-players]', String(totalPlayers));
  write('[data-stat-online-servers]', `${online}/${list.length}`);
  write('[data-stat-total-uptime]', format(running.total));
  write('[data-stat-current-uptime]', format(running.current));
  document.querySelectorAll<HTMLElement>('[data-stat-skeleton]').forEach((node) => (node.hidden = true));
  document.querySelectorAll<HTMLElement>('[data-stat-content]').forEach((node) => (node.hidden = false));
  const groups = document.querySelector<HTMLElement>('[data-server-groups]');
  if (groups) {
    groups.innerHTML = serverTree
      .map((node) => (node.type === 'CATEGORY' ? groupHtml(node) : serverHtml(servers.get(node.id)!)))
      .join('');
    bindStatusInteractions();
  }
}

async function refresh() {
  try {
    const [tree, runtime, playerResult, status] = await Promise.all([
      request('server.tree'),
      request('proxy.running_times'),
      request('player.list'),
      request('server.status_all'),
    ]);
    servers = new Map();
    const players: Player[] = (playerResult.players || []).map((player: Player) => ({
      name: player.name,
      uuid: player.uuid,
      server: player.server,
    }));
    serverTree = (tree || []).map((node: any) => collect(node, players, status || {}));
    running = { current: runtime.current_running_time || 0, total: runtime.total_running_time || 0 };
    state('已连接', 'online');
    render();
  } catch {
    state('重连中...', 'warn');
  }
}

function connect() {
  state('连接中...', 'neutral');
  try {
    socket = new WebSocket(socketUrl);
  } catch {
    state('连接失败', 'bad');
    return;
  }
  socket.addEventListener('open', async () => {
    try {
      await Promise.all([
        request('subscribe', { event: 'player.join' }),
        request('subscribe', { event: 'player.quit' }),
        request('subscribe', { event: 'player.switch_server' }),
      ]);
    } catch {
      /* polling is sufficient */
    }
    refresh();
    timer = window.setInterval(refresh, 30000);
  });
  socket.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const item = pending.get(message.id)!;
        clearTimeout(item.timeout);
        pending.delete(message.id);
        message.error ? item.reject() : item.resolve(message.result);
      }
    } catch {
      /* ignore malformed messages */
    }
  });
  socket.addEventListener('close', () => {
    if (timer) clearInterval(timer);
    state('重连中...', 'warn');
    reconnectTimer = window.setTimeout(connect, 3000);
  });
  socket.addEventListener('error', () => state('连接失败', 'bad'));
}

if (root) connect();
window.addEventListener('pagehide', () => {
  if (timer) clearInterval(timer);
  if (reconnectTimer) clearTimeout(reconnectTimer);
  socket?.close();
});
