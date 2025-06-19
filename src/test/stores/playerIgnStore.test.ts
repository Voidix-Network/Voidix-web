import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePlayerIgnStore } from '@/stores/playerIgnStore';
import { act } from '@testing-library/react';

describe('usePlayerIgnStore', () => {
  beforeEach(() => {
    // 在每次测试前重置 store
    act(() => {
      usePlayerIgnStore.getState().reset();
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该有正确的初始状态', () => {
    const { playerIgns, serverPlayerIgns } = usePlayerIgnStore.getState();
    expect(playerIgns).toEqual({});
    expect(serverPlayerIgns).toEqual({});
  });

  it('addPlayerIgn 应该能添加新的玩家 IGN', () => {
    const testDate = new Date();
    vi.setSystemTime(testDate);

    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
    });

    const { playerIgns, serverPlayerIgns } = usePlayerIgnStore.getState();

    // 验证 playerIgns
    expect(playerIgns['uuid1']).toBeDefined();
    expect(playerIgns['uuid1'].ign).toBe('Player1');
    expect(playerIgns['uuid1'].serverId).toBe('server1');
    expect(playerIgns['uuid1'].joinTime).toEqual(testDate);

    // 验证 serverPlayerIgns
    expect(serverPlayerIgns['server1']).toBeDefined();
    expect(serverPlayerIgns['server1'].length).toBe(1);
    expect(serverPlayerIgns['server1'][0].ign).toBe('Player1');
  });

  it('addPlayerIgn 应该能处理玩家在不同服务器之间移动的情况', () => {
    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server2');
    });

    const { serverPlayerIgns } = usePlayerIgnStore.getState();

    expect(serverPlayerIgns['server1']).toBeDefined();
    expect(serverPlayerIgns['server1'].length).toBe(0);
    expect(serverPlayerIgns['server2']).toBeDefined();
    expect(serverPlayerIgns['server2'].length).toBe(1);
    expect(serverPlayerIgns['server2'][0].uuid).toBe('uuid1');
  });

  it('removePlayerIgn 应该能移除玩家 IGN', () => {
    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().removePlayerIgn('uuid1');
    });

    const { playerIgns, serverPlayerIgns } = usePlayerIgnStore.getState();

    expect(playerIgns['uuid1']).toBeUndefined();
    expect(serverPlayerIgns['server1']).toBeDefined();
    expect(serverPlayerIgns['server1'].length).toBe(0);
  });

  it('updatePlayerIgn 应该能更新玩家信息', () => {
    const testDate = new Date();
    vi.setSystemTime(testDate);

    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().updatePlayerIgn('uuid1', { ign: 'Player1_new' });
    });

    const { playerIgns, serverPlayerIgns } = usePlayerIgnStore.getState();

    expect(playerIgns['uuid1'].ign).toBe('Player1_new');
    expect(playerIgns['uuid1'].lastSeen).toEqual(testDate);
    expect(serverPlayerIgns['server1'][0].ign).toBe('Player1_new');
  });

  it('updatePlayerIgn 应该能处理服务器 ID 的更新', () => {
    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().updatePlayerIgn('uuid1', { serverId: 'server2' });
    });

    const { playerIgns, serverPlayerIgns } = usePlayerIgnStore.getState();

    expect(playerIgns['uuid1'].serverId).toBe('server2');
    expect(serverPlayerIgns['server1'].length).toBe(0);
    expect(serverPlayerIgns['server2'].length).toBe(1);
    expect(serverPlayerIgns['server2'][0].uuid).toBe('uuid1');
  });

  it('getServerPlayerIgns 应该能返回指定服务器的玩家列表', () => {
    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().addPlayerIgn('uuid2', 'Player2', 'server1');
      usePlayerIgnStore.getState().addPlayerIgn('uuid3', 'Player3', 'server2');
    });

    const server1Players = usePlayerIgnStore.getState().getServerPlayerIgns('server1');
    expect(server1Players.length).toBe(2);

    const server2Players = usePlayerIgnStore.getState().getServerPlayerIgns('server2');
    expect(server2Players.length).toBe(1);

    const emptyServerPlayers = usePlayerIgnStore
      .getState()
      .getServerPlayerIgns('nonexistent-server');
    expect(emptyServerPlayers.length).toBe(0);
  });

  it('getAllPlayerIgns 应该能返回所有玩家的列表', () => {
    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().addPlayerIgn('uuid2', 'Player2', 'server1');
    });

    const allPlayers = usePlayerIgnStore.getState().getAllPlayerIgns();
    expect(allPlayers.length).toBe(2);
  });

  it('reset 应该能重置 store 到初始状态', () => {
    act(() => {
      usePlayerIgnStore.getState().addPlayerIgn('uuid1', 'Player1', 'server1');
      usePlayerIgnStore.getState().reset();
    });

    const { playerIgns, serverPlayerIgns } = usePlayerIgnStore.getState();
    expect(playerIgns).toEqual({});
    expect(serverPlayerIgns).toEqual({});
  });
});
