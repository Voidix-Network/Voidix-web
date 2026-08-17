export {};

type User = { username: string; player_uuid: string; token: string; isAdmin?: boolean };
type Tag = { id: number; name: string; color: string };
type IssueComment = { id: string; message: string; author_uuid: string; author_username: string; created_at: string };
type Issue = {
  id: string;
  title: string;
  description: string;
  author_uuid: string;
  author_username: string;
  status: string;
  created_at: string;
  pinned: boolean;
  pin_priority: number;
  comments: IssueComment[];
  tags: Tag[];
};

const apiBase = 'https://webba.voidix.net:5699';
const app = document.querySelector<HTMLElement>('[data-issue-app]');
const storedKey = 'voidix_user';
let user = readUser();
let tags: Tag[] = [];

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(storedKey) || 'null');
  } catch {
    return null;
  }
}
function setUser(value: User | null) {
  user = value;
  value ? localStorage.setItem(storedKey, JSON.stringify(value)) : localStorage.removeItem(storedKey);
}
function esc(value = '') {
  return String(value).replace(
    /[&<>'"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char,
  );
}
function color(value = '') {
  return /^#[\da-fA-F]{6}$/.test(value) ? value : '#64748b';
}
function date(value: string, concise = false) {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return '未知时间';
  if (!concise)
    return time.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  const diff = Date.now() - time.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    return hours ? `${hours}小时前` : '刚刚';
  }
  return days < 7 ? `${days}天前` : time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
function label(status: string) {
  return (
    ({ open: '待处理', in_progress: '处理中', resolved: '已解决', closed: '已关闭' } as Record<string, string>)[
      status
    ] || status
  );
}
function statusStyle(status: string) {
  return (
    (
      {
        open: 'bg-emerald-500/10 text-emerald-400',
        in_progress: 'bg-blue-500/10 text-blue-400',
        resolved: 'bg-violet-500/10 text-violet-400',
        closed: 'bg-gray-500/10 text-gray-400',
      } as Record<string, string>
    )[status] || 'bg-gray-500/10 text-gray-400'
  );
}
function badge(status: string, className = 'px-2 py-1') {
  return `<span class="${className} rounded-md text-xs font-medium flex-shrink-0 ${statusStyle(status)}">${label(status)}</span>`;
}
function tagHtml(list: Tag[] = []) {
  return list
    .map(
      (tag) =>
        `<span class="rounded px-2 py-0.5 text-xs font-medium" style="background-color:${color(tag.color)}15;color:${color(tag.color)}">${esc(tag.name)}</span>`,
    )
    .join('');
}
function markdown(text: string) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="code">$1</code>')
    .replace(/\n/g, '<br>');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  };
  if (user?.token) headers.Authorization = `Bearer ${user.token}`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({ success: false, error: '服务器返回无效响应' }));
    if (!response.ok || (data && typeof data === 'object' && 'success' in data && data.success === false)) {
      throw new Error(data.error || '请求失败');
    }
    return data as T;
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === 'AbortError') throw new Error('请求超时，请稍后重试');
    throw caught;
  } finally {
    clearTimeout(timeout);
  }
}
async function validate() {
  if (!user?.token) return null;
  try {
    const response = await request<{ valid: boolean; username?: string; player_uuid?: string; isAdmin?: boolean }>(
      '/auth/validate',
      { method: 'POST' },
    );
    if (!response.valid) setUser(null);
    else
      setUser({
        ...user,
        username: response.username || user.username,
        player_uuid: response.player_uuid || user.player_uuid,
        isAdmin: response.isAdmin,
      });
  } catch {
    setUser(null);
  }
  return user;
}
function error(message: string) {
  const target = app?.querySelector<HTMLElement>('[data-form-error]');
  if (target) {
    const messageTarget = target.querySelector<HTMLElement>('[data-form-error-message]');
    if (messageTarget) messageTarget.textContent = message;
    else target.textContent = message;
    target.hidden = false;
  } else window.alert(message);
}
function clearError() {
  const target = app?.querySelector<HTMLElement>('[data-form-error]');
  if (target) target.hidden = true;
}
function shell(content: string) {
  if (app) app.innerHTML = `<div class="issue-page">${content}</div>`;
}
function icon(name: string, className: string) {
  const paths: Record<string, string> = {
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2 2-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20h-3v-.09A1.65 1.65 0 0 0 11 18.4a1.65 1.65 0 0 0-1.82.33l-.06.06-2-2 .06-.06A1.65 1.65 0 0 0 7.51 15a1.65 1.65 0 0 0-1.51-1H6v-3h.09A1.65 1.65 0 0 0 7.6 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06 2-2 .06.06A1.65 1.65 0 0 0 11 6.51h.01A1.65 1.65 0 0 0 12 5V5h3v.09A1.65 1.65 0 0 0 16 6.6a1.65 1.65 0 0 0 1.82-.33l.06-.06 2 2-.06.06A1.65 1.65 0 0 0 19.49 10v.01A1.65 1.65 0 0 0 21 11h.09v3H21a1.65 1.65 0 0 0-1.6 1Z"/>',
    refresh:
      '<path d="M21 12a9 9 0 0 0-15.2-6.5L3 8"/><path d="M3 3v5h5M3 12a9 9 0 0 0 15.2 6.5L21 16"/><path d="M16 16h5v5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    pin: '<path d="M12 17v5M9 3h6l1 7 3 3H5l3-3 1-7Z"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    arrowLeft: '<path d="M19 12H5m7 7-7-7 7-7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    palette:
      '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 22a10 10 0 1 1 10-10c0 1.1-.9 2-2 2h-1.5a1.5 1.5 0 0 0-1.5 1.5c0 .83.67 1.5 1.5 1.5.83 0 1.5.67 1.5 1.5 0 1.1-.9 2-2 2Z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
  };
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}
function header(title: string, action = '') {
  return `<nav class="breadcrumb" aria-label="面包屑"><a href="/">首页</a><span>/</span><span>${title}</span></nav><header class="issue-header"><h1>${title}</h1><div>${user ? `<span style="color:#9ca3af;font-size:.85rem">${esc(user.username)}</span> <button class="button small secondary" data-logout>退出</button>` : `<a class="button small secondary" href="/login/">登录</a>`} ${action}</div></header>`;
}
function loading() {
  shell(`${header('Issues')}<div class="issue-empty">加载中...</div>`);
}

async function loadTags() {
  try {
    const response = await request<{ success: boolean; tags?: Tag[] }>('/tag/get_tags');
    tags = response.tags || [];
  } catch {
    tags = [];
  }
}

async function listIssues(page = 1) {
  loading();
  await validate();
  await loadTags();
  try {
    const response = await request<{
      success: boolean;
      issues?: Issue[];
      pagination?: { currentPage: number; totalPages: number; totalItems: number };
    }>(`/issue/get_issues?page=${page}&pageSize=10`);
    const issues = (response.issues || []).sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        (b.pin_priority || 0) - (a.pin_priority || 0) ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const totalPages = response.pagination?.totalPages || 1;
    const totalItems = response.pagination?.totalItems || issues.length;
    const tagButtons = tags
      .map(
        (tag) =>
          `<button class="rounded-md px-2.5 py-1 text-xs font-medium opacity-60 transition-all hover:opacity-100" data-filter-tag="${tag.id}" style="background-color:${color(tag.color)}20;color:${color(tag.color)}">${esc(tag.name)}</button>`,
      )
      .join('');
    const rows =
      issues
        .map(
          (issue) =>
            `<a class="group block cursor-pointer rounded-xl bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50" data-issue-row href="/issue/${encodeURIComponent(issue.id)}" data-title="${esc(issue.title).toLowerCase()}" data-body="${esc(issue.description).toLowerCase()}" data-status="${esc(issue.status)}" data-tags="${issue.tags.map((tag) => tag.id).join(',')}"><div class="flex items-start gap-4"><div class="min-w-0 flex-1"><div class="mb-1.5 flex items-center gap-2">${issue.pinned ? icon('pin', 'h-3.5 w-3.5 flex-shrink-0 text-amber-400') : ''}<h3 class="truncate text-[15px] font-medium text-gray-100 group-hover:text-white">${esc(issue.title)}</h3></div><p class="mb-2 line-clamp-1 text-sm text-gray-500">${esc(issue.description)}</p><div class="flex items-center gap-3 text-xs text-gray-500"><span class="flex items-center gap-1">${icon('user', 'h-3 w-3')}${esc(issue.author_username)}</span><span class="flex items-center gap-1">${icon('clock', 'h-3 w-3')}${date(issue.created_at, true)}</span>${issue.comments?.length ? `<span class="flex items-center gap-1">${icon('message', 'h-3 w-3')}${issue.comments.length}</span>` : ''}${
              issue.tags?.length
                ? `<span class="flex gap-1">${issue.tags
                    .slice(0, 3)
                    .map(
                      (tag) =>
                        `<span class="rounded px-1.5 py-0.5 text-[10px] font-medium" style="background-color:${color(tag.color)}15;color:${color(tag.color)}">${esc(tag.name)}</span>`,
                    )
                    .join(
                      '',
                    )}${issue.tags.length > 3 ? `<span class="text-gray-600">+${issue.tags.length - 3}</span>` : ''}</span>`
                : ''
            }</div></div>${badge(issue.status)}</div></a>`,
        )
        .join('') || '<div class="py-16 text-center text-gray-500"><p>暂无数据</p></div>';
    const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) =>
      totalPages <= 5
        ? index + 1
        : page <= 3
          ? index + 1
          : page >= totalPages - 2
            ? totalPages - 4 + index
            : page - 2 + index,
    )
      .map(
        (number) =>
          `<button class="h-8 w-8 rounded-lg text-sm font-medium transition-colors ${number === page ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}" data-page="${number}">${number}</button>`,
      )
      .join('');
    const pagination =
      totalPages > 1
        ? `<div class="mt-8 flex items-center justify-center gap-1"><button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 'h-4 w-4')}</button>${pageNumbers}<button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>${icon('chevronRight', 'h-4 w-4')}</button></div>`
        : '';
    shell(
      `<nav class="breadcrumb mb-6" aria-label="面包屑"><a href="/">首页</a><span>/</span><span>Issue系统</span></nav><div class="mb-6 flex items-center justify-between"><h1 class="text-2xl font-semibold text-white">Issues</h1><div class="flex items-center gap-2">${user?.isAdmin ? `<a href="/tag-manage/" class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white" title="标签管理">${icon('settings', 'h-4 w-4')}</a>` : ''}<button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50" data-reload title="刷新">${icon('refresh', 'h-4 w-4')}</button><a href="${user ? '/issue/create/' : '/login/'}" class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">${icon('plus', 'h-4 w-4')}新建</a>${user ? `<button class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white" data-logout>${icon('logout', 'h-4 w-4')}登出</button>` : ''}</div></div><div class="mb-6 space-y-3 rounded-xl bg-gray-800/40 p-4"><div class="flex flex-col gap-3 sm:flex-row"><div class="relative flex-1">${icon('search', 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500')}<input class="w-full rounded-lg border border-gray-700/50 bg-gray-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none" data-issue-search placeholder="搜索..." /></div><div class="flex gap-1.5"><button class="rounded-lg bg-gray-700 px-3 py-2 text-xs font-medium text-white" data-filter-status="all">全部</button><button class="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-gray-300" data-filter-status="open">待处理</button><button class="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-gray-300" data-filter-status="in_progress">处理中</button><button class="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-gray-300" data-filter-status="resolved">已解决</button><button class="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-gray-300" data-filter-status="closed">已关闭</button></div></div>${tagButtons ? `<div class="flex flex-wrap gap-1.5">${tagButtons}</div>` : ''}<div class="flex items-center justify-between text-xs text-gray-500"><span data-filter-count>共 ${totalItems} 条</span><span>第 ${page} / ${totalPages} 页</span></div></div><div class="space-y-2" data-issue-list>${rows}</div>${pagination}`,
    );
    app?.querySelector('[data-reload]')?.addEventListener('click', () => listIssues(page));
    bindList(page, totalItems);
  } catch (caught) {
    shell(
      `${header('Issues')}<div class="issue-empty">${esc(caught instanceof Error ? caught.message : '获取 Issues 失败')}<br><button class="button small" style="margin-top:1rem" data-reload>重试</button></div>`,
    );
    app?.querySelector('[data-reload]')?.addEventListener('click', () => listIssues(page));
  }
}

function bindList(page: number, totalItems: number) {
  let chosenStatus = 'all';
  const chosenTags = new Set<string>();
  const filter = () => {
    const keyword = (app?.querySelector<HTMLInputElement>('[data-issue-search]')?.value || '').toLowerCase();
    let visible = 0;
    app?.querySelectorAll<HTMLElement>('[data-issue-row]').forEach((row) => {
      const matchText = `${row.dataset.title} ${row.dataset.body}`.includes(keyword);
      const matchStatus = chosenStatus === 'all' || row.dataset.status === chosenStatus;
      const rowTags = (row.dataset.tags || '').split(',');
      const matchTags = !chosenTags.size || [...chosenTags].some((id) => rowTags.includes(id));
      row.hidden = !(matchText && matchStatus && matchTags);
      if (!row.hidden) visible++;
    });
    const count = app?.querySelector<HTMLElement>('[data-filter-count]');
    if (count)
      count.textContent =
        keyword || chosenStatus !== 'all' || chosenTags.size
          ? `${visible} / ${totalItems} 条结果`
          : `共 ${totalItems} 条`;
  };
  app?.querySelector('[data-issue-search]')?.addEventListener('input', filter);
  app?.querySelectorAll<HTMLElement>('[data-filter-status]').forEach((button) =>
    button.addEventListener('click', () => {
      chosenStatus = button.dataset.filterStatus || 'all';
      app?.querySelectorAll<HTMLElement>('[data-filter-status]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('bg-gray-700', active);
        item.classList.toggle('text-white', active);
        item.classList.toggle('text-gray-400', !active);
      });
      filter();
    }),
  );
  app?.querySelectorAll<HTMLElement>('[data-filter-tag]').forEach((button) =>
    button.addEventListener('click', () => {
      const id = button.dataset.filterTag || '';
      chosenTags.has(id) ? chosenTags.delete(id) : chosenTags.add(id);
      button.classList.toggle('ring-1', chosenTags.has(id));
      button.classList.toggle('ring-white/30', chosenTags.has(id));
      button.classList.toggle('opacity-60', !chosenTags.has(id));
      filter();
    }),
  );
  app
    ?.querySelectorAll<HTMLButtonElement>('[data-page]')
    .forEach((button) => button.addEventListener('click', () => listIssues(Number(button.dataset.page || page))));
}

async function issueForm(editId?: string) {
  await validate();
  if (!user) {
    location.assign('/login/');
    return;
  }
  await loadTags();
  let initial: Partial<Issue> = {};
  if (editId) {
    try {
      initial = (await request<{ issue?: Issue }>(`/issue/get_issue?id=${encodeURIComponent(editId)}`)).issue || {};
      if (initial.author_uuid !== user.player_uuid && !user.isAdmin) {
        location.assign(`/issue/${editId}`);
        return;
      }
    } catch {
      location.assign('/issue/');
      return;
    }
  }
  const selected = new Set((initial.tags || []).map((tag) => tag.id));
  const options = () =>
    tags
      .map(
        (tag) =>
          `<button type="button" data-select-tag="${tag.id}" class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${selected.has(tag.id) ? 'ring-1 ring-white/20' : 'opacity-50 hover:opacity-100'}" style="background-color:${color(tag.color)}20;color:${color(tag.color)}">${selected.has(tag.id) ? icon('check', 'h-3 w-3') : ''}${esc(tag.name)}</button>`,
      )
      .join('');
  const back = editId ? `/issue/${encodeURIComponent(editId)}` : '/issue/';
  shell(
    `<div class="mx-auto max-w-2xl"><nav class="breadcrumb mb-6" aria-label="面包屑"><a href="/">首页</a><span>/</span><a href="/issue/">Issues</a><span>/</span><span>${editId ? '编辑' : '新建'}</span></nav><div class="mb-6 flex items-center justify-between"><a href="${back}" class="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white">${icon('arrowLeft', 'h-4 w-4')}返回</a><h1 class="text-xl font-semibold text-white">${editId ? '编辑 Issue' : '新建 Issue'}</h1><div class="w-16"></div></div><p class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" data-form-error hidden></p><form class="space-y-5" data-issue-form><div><label class="mb-2 block text-sm text-gray-400">标题 <span class="text-red-400">*</span></label><input name="title" maxlength="120" value="${esc(initial.title || '')}" placeholder="简明扼要地描述问题" class="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none" data-issue-title /><p class="mt-1.5 text-xs text-red-400" data-title-error hidden>至少 5 个字符</p></div>${tags.length ? `<div><label class="mb-2 block text-sm text-gray-400">标签</label><div class="flex flex-wrap gap-2" data-tag-options>${options()}</div></div>` : ''}<div><label class="mb-2 block text-sm text-gray-400">描述 <span class="text-red-400">*</span></label><textarea name="description" rows="8" placeholder="详细描述你遇到的问题..." class="w-full resize-y rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none" data-issue-description>${esc(initial.description || '')}</textarea><div class="mt-1.5 flex items-center justify-between"><span class="text-xs text-gray-600">支持 Markdown</span><span class="text-xs text-red-400" data-description-error hidden>至少 10 个字符</span></div></div>${editId && user.isAdmin ? `<div><label class="mb-2 block text-sm text-gray-400">状态</label><select name="status" class="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white transition-colors focus:border-gray-600 focus:outline-none"><option value="open" ${initial.status === 'open' ? 'selected' : ''}>待处理</option><option value="in_progress" ${initial.status === 'in_progress' ? 'selected' : ''}>处理中</option><option value="resolved" ${initial.status === 'resolved' ? 'selected' : ''}>已解决</option><option value="closed" ${initial.status === 'closed' ? 'selected' : ''}>已关闭</option></select></div>` : ''}<div class="flex gap-3 pt-2"><button class="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="submit" data-form-submit disabled>${editId ? '保存' : '创建'}</button><a href="${back}" class="rounded-lg bg-gray-700 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-gray-600">取消</a></div></form></div>`,
  );
  const form = app?.querySelector<HTMLFormElement>('[data-issue-form]');
  const title = form?.querySelector<HTMLInputElement>('[data-issue-title]');
  const description = form?.querySelector<HTMLTextAreaElement>('[data-issue-description]');
  const submit = form?.querySelector<HTMLButtonElement>('[data-form-submit]');
  const syncValidity = () => {
    const titleInvalid = Boolean(title?.value) && (title?.value.trim().length || 0) < 5;
    const descriptionInvalid = Boolean(description?.value) && (description?.value.trim().length || 0) < 10;
    app?.querySelector<HTMLElement>('[data-title-error]')?.toggleAttribute('hidden', !titleInvalid);
    app?.querySelector<HTMLElement>('[data-description-error]')?.toggleAttribute('hidden', !descriptionInvalid);
    if (submit) submit.disabled = (title?.value.trim().length || 0) < 5 || (description?.value.trim().length || 0) < 10;
  };
  title?.addEventListener('input', syncValidity);
  description?.addEventListener('input', syncValidity);
  syncValidity();
  const bindTagButtons = () =>
    app?.querySelectorAll<HTMLElement>('[data-select-tag]').forEach((button) =>
      button.addEventListener('click', () => {
        const id = Number(button.dataset.selectTag);
        selected.has(id) ? selected.delete(id) : selected.add(id);
        const host = app?.querySelector<HTMLElement>('[data-tag-options]');
        if (host) {
          host.innerHTML = options();
          bindTagButtons();
        }
      }),
    );
  bindTagButtons();
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();
    const payload = {
      title: title?.value.trim() || '',
      description: description?.value.trim() || '',
      tags: [...selected],
      status: String(new FormData(form).get('status') || initial.status || 'open'),
    };
    if (payload.title.length < 5 || payload.description.length < 10) return;
    if (submit) {
      submit.disabled = true;
      submit.textContent = '提交中...';
    }
    try {
      const response = editId
        ? await request<{ success: boolean; issue?: Issue }>('/issue/update', {
            method: 'POST',
            body: JSON.stringify({ id: editId, ...payload }),
          })
        : await request<{ success: boolean; issue?: Issue }>('/issue/create', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      location.assign(`/issue/${response.issue?.id || editId}`);
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '提交失败');
      if (submit) {
        submit.disabled = false;
        submit.textContent = editId ? '保存' : '创建';
      }
    }
  });
}

async function detail(id: string) {
  await validate();
  shell(`${header('Issue 详情')}<div class="issue-empty">加载中...</div>`);
  try {
    const response = await request<{ issue?: Issue }>(`/issue/get_issue?id=${encodeURIComponent(id)}`);
    const issue = response.issue;
    if (!issue) throw new Error('Issue 不存在');
    const canEdit = !!user && (user.isAdmin || issue.author_uuid === user.player_uuid);
    const canStatus = canEdit;
    const comments =
      [...(issue.comments || [])]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(
          (comment) =>
            `<article class="comment"><header><span>${esc(comment.author_username)} · ${date(comment.created_at)}</span>${user && (user.isAdmin || user.player_uuid === comment.author_uuid || user.player_uuid === issue.author_uuid) ? `<button class="button small danger" data-delete-comment="${esc(comment.id)}">删除</button>` : ''}</header><p class="markdown">${markdown(comment.message)}</p></article>`,
        )
        .join('') || '<div class="issue-empty">暂无评论</div>';
    const controls = `${user?.isAdmin ? `<button class="rounded-lg p-2 ${issue.pinned ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors" data-pin="${issue.pinned ? 'false' : 'true'}" title="${issue.pinned ? '取消置顶' : '置顶'}">${icon('pin', 'h-4 w-4')}</button>` : ''}${canEdit ? `<a class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white" href="/issue/edit/${encodeURIComponent(id)}" title="编辑">${icon('edit', 'h-4 w-4')}</a><button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400" data-delete-issue title="删除">${icon('trash', 'h-4 w-4')}</button>` : ''}`;
    const statusControl = canStatus
      ? user?.isAdmin
        ? `<select data-status-change><option value="open" ${issue.status === 'open' ? 'selected' : ''}>待处理</option><option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>处理中</option><option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>已解决</option><option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>已关闭</option></select>`
        : issue.status !== 'closed'
          ? '<button class="button small secondary" data-close-issue>关闭 Issue</button>'
          : ''
      : '';
    shell(
      `<div class="issue-detail"><nav class="breadcrumb mb-6" aria-label="面包屑"><a href="/">首页</a><span>/</span><a href="/issue/">Issue系统</a><span>/</span><span>详情</span></nav><div class="mb-6 flex items-center justify-between"><a class="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white" href="/issue/">${icon('arrowLeft', 'h-4 w-4')}返回</a><div class="flex items-center gap-2"><button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white" data-refresh title="刷新">${icon('refresh', 'h-4 w-4')}</button>${controls}</div></div><article class="detail-card"><header class="mb-4 flex items-start justify-between gap-4"><div class="min-w-0 flex-1">${issue.pinned ? `<div class="mb-2 flex items-center gap-1.5 text-xs text-amber-400">${icon('pin', 'h-3 w-3')}<span>置顶 · P${issue.pin_priority}</span></div>` : ''}<h1>${esc(issue.title)}</h1></div>${badge(issue.status, 'px-2.5 py-1')}</header><div class="mb-4 flex items-center gap-4 text-sm text-gray-500"><span class="flex items-center gap-1.5">${icon('user', 'h-3.5 w-3.5')}${esc(issue.author_username)}</span><span class="flex items-center gap-1.5">${icon('clock', 'h-3.5 w-3.5')}${date(issue.created_at)}</span></div><div class="mb-4 flex flex-wrap gap-1.5">${tagHtml(issue.tags)}</div><div class="markdown" style="margin-top:1.25rem">${markdown(issue.description)}</div>${statusControl ? `<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #374151">${statusControl}</div>` : ''}</article><section class="comments"><h2 class="flex items-center gap-2">${icon('message', 'h-5 w-5 text-gray-500')}评论 (${issue.comments?.length || 0})</h2>${user ? `<form class="comment-box" data-comment-form><textarea name="message" class="w-full min-h-[80px] resize-none bg-transparent text-white placeholder-gray-500 focus:outline-none" placeholder="写下你的评论..."></textarea><div class="mt-3 flex items-center justify-between"><span class="text-xs text-gray-600">支持 Markdown</span><button class="button small" type="submit">发送</button></div></form>` : '<div class="comment-box" style="text-align:center;color:#9ca3af">登录后可以发表评论<br><a class="button small" style="margin-top:.6rem" href="/login/">登录</a></div>'}<div data-comments>${comments}</div></section></div>`,
    );
    bindDetail(issue);
  } catch (caught) {
    shell(
      `${header('Issue 详情')}<div class="issue-empty">${esc(caught instanceof Error ? caught.message : '加载失败')}<br><a class="button small" style="margin-top:1rem" href="/issue/">返回 Issue 列表</a></div>`,
    );
  }
}

function bindDetail(issue: Issue) {
  app?.querySelector('[data-refresh]')?.addEventListener('click', () => detail(issue.id));
  app?.querySelector<HTMLFormElement>('[data-comment-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const message = String(new FormData(form).get('message') || '').trim();
    if (!message) return;
    try {
      await request('/issue/add_comment', { method: 'POST', body: JSON.stringify({ issue_id: issue.id, message }) });
      detail(issue.id);
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '发送失败');
    }
  });
  app?.querySelector('[data-delete-issue]')?.addEventListener('click', async () => {
    if (!confirm('确定删除这个 Issue？此操作不可恢复。')) return;
    try {
      await request('/issue/delete', { method: 'POST', body: JSON.stringify({ id: issue.id }) });
      location.assign('/issue/');
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '删除失败');
    }
  });
  app?.querySelectorAll<HTMLElement>('[data-delete-comment]').forEach((button) =>
    button.addEventListener('click', async () => {
      if (!confirm('确定删除这条评论？')) return;
      try {
        await request('/issue/delete_comment', {
          method: 'POST',
          body: JSON.stringify({ issue_id: issue.id, comment_id: button.dataset.deleteComment }),
        });
        detail(issue.id);
      } catch (caught) {
        error(caught instanceof Error ? caught.message : '删除失败');
      }
    }),
  );
  app?.querySelector<HTMLSelectElement>('[data-status-change]')?.addEventListener('change', async (event) => {
    const status = (event.currentTarget as HTMLSelectElement).value;
    try {
      await request('/issue/update', { method: 'POST', body: JSON.stringify({ id: issue.id, status }) });
      await request('/issue/add_comment', {
        method: 'POST',
        body: JSON.stringify({
          issue_id: issue.id,
          message: `将状态从 **${label(issue.status)}** 改为 **${label(status)}**`,
        }),
      });
      detail(issue.id);
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '更新失败');
    }
  });
  app?.querySelector('[data-close-issue]')?.addEventListener('click', async () => {
    if (!confirm('确定关闭？关闭后只有管理员可以重新打开。')) return;
    try {
      await request('/issue/update', { method: 'POST', body: JSON.stringify({ id: issue.id, status: 'closed' }) });
      detail(issue.id);
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '更新失败');
    }
  });
  app?.querySelector<HTMLElement>('[data-pin]')?.addEventListener('click', async (event) => {
    const pinned = (event.currentTarget as HTMLElement).dataset.pin === 'true';
    const pin = async (priority: number) => {
      try {
        await request('/issue/pin', {
          method: 'POST',
          body: JSON.stringify({ id: issue.id, pinned, pin_priority: Math.max(1, Math.min(10, priority)) }),
        });
        detail(issue.id);
      } catch (caught) {
        error(caught instanceof Error ? caught.message : '操作失败');
      }
    };
    if (!pinned) return pin(5);
    const dialog = document.createElement('section');
    dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4';
    dialog.innerHTML = `<div class="w-full max-w-sm rounded-xl bg-gray-800 p-6"><h3 class="mb-4 text-lg font-medium text-white">设置置顶优先级</h3><input type="number" min="1" max="10" value="5" class="mb-4 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white" data-pin-priority><p class="mb-4 text-xs text-gray-500">1-10，数字越大优先级越高</p><div class="flex gap-2"><button class="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600" data-pin-cancel>取消</button><button class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700" data-pin-confirm>确认置顶</button></div></div>`;
    document.body.append(dialog);
    const close = () => dialog.remove();
    dialog.querySelector('[data-pin-cancel]')?.addEventListener('click', close);
    dialog.querySelector('[data-pin-confirm]')?.addEventListener('click', () => {
      const value = dialog.querySelector<HTMLInputElement>('[data-pin-priority]')?.valueAsNumber || 5;
      close();
      pin(value);
    });
  });
}

async function manageTags() {
  await validate();
  if (!user?.isAdmin) {
    location.assign('/issue/');
    return;
  }
  await loadTags();
  const tagRows = () =>
    tags
      .map(
        (tag) =>
          `<article class="rounded-2xl border border-gray-700 bg-gray-800/50 border-l-4 p-4" style="border-left-color:${color(tag.color)}"><div class="flex items-start justify-between gap-3"><div class="flex-1"><div class="mb-2 flex items-center gap-2"><span class="h-4 w-4 rounded-full" style="background-color:${color(tag.color)}"></span><span class="font-semibold text-white">${esc(tag.name)}</span></div><p class="font-mono text-xs text-gray-500">${color(tag.color)}</p></div><div class="flex gap-1"><button class="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-900/20" data-edit-tag="${tag.id}" title="编辑">${icon('edit', 'h-4 w-4')}</button><button class="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-900/20" data-delete-tag="${tag.id}" title="删除">${icon('trash', 'h-4 w-4')}</button></div></div></article>`,
      )
      .join('') ||
    '<div class="py-12 text-center"><p class="text-gray-400">暂无标签</p><p class="mt-2 text-sm text-gray-500">点击上方“新建标签”按钮创建</p></div>';
  shell(
    `<nav class="breadcrumb mb-8" aria-label="面包屑"><a href="/">首页</a><span>/</span><a href="/issue/">Issue系统</a><span>/</span><span>标签管理</span></nav><div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><h1 class="text-4xl font-bold"><span class="gradient-text">标签管理</span></h1><button class="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700" data-new-tag>${icon('plus', 'mr-2 inline h-5 w-5')}新建标签</button></div><p class="mb-6 rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-300" data-form-error hidden></p><section class="mb-8 rounded-2xl border border-gray-700 bg-gray-800/50 p-8"><h2 class="mb-6 flex items-center gap-2 text-xl font-semibold"><span class="text-blue-400">◉</span><span data-tag-form-title>创建新标签</span></h2><form class="space-y-6" data-tag-form><input type="hidden" name="id"><div class="space-y-2"><label class="block text-sm font-medium text-gray-300">标签名称 <span class="text-red-400">*</span></label><input name="name" maxlength="50" required placeholder="输入标签名称" class="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><p class="text-xs text-gray-500">最多50个字符</p></div><div class="space-y-2"><label class="block text-sm font-medium text-gray-300">标签颜色</label><div class="flex items-center gap-4"><input type="color" value="#3b82f6" class="h-12 w-12 cursor-pointer rounded border-2 border-gray-600" data-color-picker><input name="color" value="#3b82f6" class="flex-1 rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500" data-color-text></div><div class="mt-3 flex flex-wrap gap-2">${['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#94a3b8'].map((preset) => `<button type="button" class="h-8 w-8 rounded-full border-2 border-gray-600 transition-all hover:border-white" style="background-color:${preset}" data-preset-color="${preset}" title="${preset}"></button>`).join('')}</div></div><div class="flex gap-3"><button class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700" type="submit">创建标签</button><button class="rounded-lg border border-gray-600 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white" type="button" data-cancel-tag hidden>取消编辑</button></div></form></section><section class="rounded-2xl border border-gray-700 bg-gray-800/50 p-8"><h2 class="mb-6 text-xl font-semibold">标签列表 (${tags.length})</h2><div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" data-tag-list>${tagRows()}</div></section><div class="mt-8 text-center"><a href="/issue/" class="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600">返回Issue系统</a></div>`,
  );
  const form = app?.querySelector<HTMLFormElement>('[data-tag-form]');
  const reset = () => {
    form?.reset();
    const tagId = form?.elements.namedItem('id');
    if (tagId instanceof HTMLInputElement) tagId.value = '';
    const title = app?.querySelector('[data-tag-form-title]');
    if (title) title.textContent = '创建新标签';
    const button = form?.querySelector('button[type=submit]');
    if (button) button.textContent = '创建标签';
    app?.querySelector<HTMLElement>('[data-cancel-tag]')?.setAttribute('hidden', '');
  };
  const colorPicker = app?.querySelector<HTMLInputElement>('[data-color-picker]');
  const colorText = app?.querySelector<HTMLInputElement>('[data-color-text]');
  const syncColor = (value: string) => {
    if (colorText) colorText.value = value;
    if (colorPicker) colorPicker.value = value;
  };
  colorPicker?.addEventListener('input', () => syncColor(colorPicker.value));
  colorText?.addEventListener('input', () => {
    if (/^#[\da-fA-F]{6}$/.test(colorText.value)) syncColor(colorText.value);
  });
  app
    ?.querySelectorAll<HTMLElement>('[data-preset-color]')
    .forEach((button) => button.addEventListener('click', () => syncColor(button.dataset.presetColor || '#3b82f6')));
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const id = String(data.get('id') || '');
    const payload = { name: String(data.get('name') || '').trim(), color: String(data.get('color') || '#3b82f6') };
    if (!payload.name) return error('标签名称不能为空');
    try {
      await request(id ? '/tag/update' : '/tag/create', {
        method: 'POST',
        body: JSON.stringify(id ? { id: Number(id), ...payload } : payload),
      });
      manageTags();
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '操作失败');
    }
  });
  app?.querySelectorAll<HTMLElement>('[data-edit-tag]').forEach((button) =>
    button.addEventListener('click', () => {
      const tag = tags.find((item) => item.id === Number(button.dataset.editTag));
      if (!tag || !form) return;
      (form.elements.namedItem('id') as HTMLInputElement).value = String(tag.id);
      (form.elements.namedItem('name') as HTMLInputElement).value = tag.name;
      syncColor(color(tag.color));
      const title = app?.querySelector('[data-tag-form-title]');
      if (title) title.textContent = '编辑标签';
      const submit = form.querySelector('button[type=submit]');
      if (submit) submit.textContent = '更新标签';
      app?.querySelector<HTMLElement>('[data-cancel-tag]')?.removeAttribute('hidden');
      form.scrollIntoView({ behavior: 'smooth' });
    }),
  );
  app?.querySelectorAll<HTMLElement>('[data-delete-tag]').forEach((button) =>
    button.addEventListener('click', async () => {
      const tag = tags.find((item) => item.id === Number(button.dataset.deleteTag));
      if (!tag || !confirm(`确定要删除标签 “${tag.name}” 吗？`)) return;
      try {
        await request('/tag/delete', { method: 'POST', body: JSON.stringify({ id: tag.id }) });
        manageTags();
      } catch (caught) {
        error(caught instanceof Error ? caught.message : '删除失败');
      }
    }),
  );
  app?.querySelector('[data-cancel-tag]')?.addEventListener('click', reset);
  app?.querySelector('[data-new-tag]')?.addEventListener('click', () => {
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function login() {
  await validate();
  if (user) {
    location.assign('/issue/');
    return;
  }
  const form = app?.querySelector<HTMLFormElement>('[data-login-form]');
  if (!form) return;
  const usernameInput = form.querySelector<HTMLInputElement>('[data-login-username]');
  const passwordInput = form.querySelector<HTMLInputElement>('[data-login-password]');
  const submit = form.querySelector<HTMLButtonElement>('[data-login-submit]');
  const syncSubmit = () => {
    if (submit) submit.disabled = !(usernameInput?.value.trim() && passwordInput?.value);
  };
  usernameInput?.addEventListener('input', syncSubmit);
  passwordInput?.addEventListener('input', syncSubmit);
  syncSubmit();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();
    const values = new FormData(form);
    const username = String(values.get('username') || '').trim();
    const password = String(values.get('password') || '');
    if (!username || !password) return;
    if (submit) {
      submit.disabled = true;
      submit.innerHTML =
        '<span class="flex items-center justify-center gap-2"><span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>登录中...</span>';
    }
    try {
      const result = await request<{
        success: boolean;
        token?: string;
        username?: string;
        player_uuid?: string;
        isAdmin?: boolean;
        error?: string;
      }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      if (!result.success || !result.token || !result.username || !result.player_uuid)
        throw new Error(result.error || '登录失败');
      setUser({
        token: result.token,
        username: result.username,
        player_uuid: result.player_uuid,
        isAdmin: result.isAdmin,
      });
      location.assign('/issue/');
    } catch (caught) {
      error(caught instanceof Error ? caught.message : '登录失败');
      if (submit) {
        submit.disabled = false;
        submit.textContent = '登录';
      }
    }
  });
}

function route() {
  if (!app) return;
  const mode = app.dataset.mode;
  const path = location.pathname.replace(/\/$/, '');
  if (mode === 'login') return login();
  if (mode === 'tags') return manageTags();
  const edit = path.match(/^\/issue\/edit\/([^/]+)$/);
  if (edit) return issueForm(decodeURIComponent(edit[1]));
  if (path === '/issue/create') return issueForm();
  const detailMatch = path.match(/^\/issue\/([^/]+)$/);
  if (detailMatch) return detail(decodeURIComponent(detailMatch[1]));
  return listIssues();
}
document.addEventListener('click', async (event) => {
  const logout = (event.target as Element).closest('[data-logout]');
  if (logout) {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      /* local sign out still succeeds */
    }
    setUser(null);
    location.assign('/issue/');
  }
});
route();
