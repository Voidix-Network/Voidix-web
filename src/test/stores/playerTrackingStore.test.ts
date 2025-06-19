import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlayerTrackingStore } from '@/stores/playerTrackingStore';
import { act } from '@testing-library/react';

describe('usePlayerTrackingStore', () => {
  beforeEach(() => {
    // 在每次测试前重置 store
    act(() => {
      usePlayerTrackingStore.getState().reset();
    });
  });

  it('应该有正确的初始状态', () => {
    const { playersLocation } = usePlayerTrackingStore.getState();
    expect(playersLocation).toEqual({});
  });

  it('handlePlayerAdd 应该能添加玩家位置', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
    });

    const { playersLocation } = usePlayerTrackingStore.getState();
    expect(playersLocation['player1']).toBe('server1');
  });

  it('handlePlayerAdd 应该能处理重复添加的情况', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[PlayerTrackingStore] 玩家 player1 重复上线到同一服务器 server1，跳过处理'
    );
    consoleWarnSpy.mockRestore();
  });

  it('handlePlayerRemove 应该能移除玩家位置', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
      usePlayerTrackingStore.getState().handlePlayerRemove('player1');
    });

    const { playersLocation } = usePlayerTrackingStore.getState();
    expect(playersLocation['player1']).toBeUndefined();
  });

  it('handlePlayerMove 应该能更新玩家位置', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
      usePlayerTrackingStore.getState().handlePlayerMove('player1', 'server1', 'server2');
    });

    const { playersLocation } = usePlayerTrackingStore.getState();
    expect(playersLocation['player1']).toBe('server2');
  });

  it('getPlayerLocation 应该能返回玩家的当前位置', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
    });

    const location = usePlayerTrackingStore.getState().getPlayerLocation('player1');
    expect(location).toBe('server1');
  });

  it('getPlayersInServer 应该能返回在指定服务器的所有玩家', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
      usePlayerTrackingStore.getState().handlePlayerAdd('player2', 'server1');
      usePlayerTrackingStore.getState().handlePlayerAdd('player3', 'server2');
    });

    const players = usePlayerTrackingStore.getState().getPlayersInServer('server1');
    expect(players).toEqual(['player1', 'player2']);
  });

  it('getTotalOnlinePlayers 应该能返回在线玩家总数', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
      usePlayerTrackingStore.getState().handlePlayerAdd('player2', 'server1');
    });

    const totalPlayers = usePlayerTrackingStore.getState().getTotalOnlinePlayers();
    expect(totalPlayers).toBe(2);
  });

  it('reset 应该能重置 store 到初始状态', () => {
    act(() => {
      usePlayerTrackingStore.getState().handlePlayerAdd('player1', 'server1');
      usePlayerTrackingStore.getState().reset();
    });

    const { playersLocation } = usePlayerTrackingStore.getState();
    expect(playersLocation).toEqual({});
  });
});
