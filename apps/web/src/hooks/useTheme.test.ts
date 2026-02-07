import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from './useTheme';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({ theme: 'schlicht' });
    // Clear localStorage
    localStorage.clear();
    // Clear document classes
    document.documentElement.classList.remove('dark', 'modern');
  });

  it('should return default theme "schlicht"', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.theme).toBe('schlicht');
  });

  it('should switch theme and set CSS class on document.documentElement', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dunkel');
    });

    expect(result.current.theme).toBe('dunkel');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should set "dark" class for theme "dunkel"', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dunkel');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('modern')).toBe(false);
  });

  it('should set "modern" class for theme "modern"', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('modern');
    });

    expect(document.documentElement.classList.contains('modern')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should set no class for theme "schlicht"', () => {
    const { result } = renderHook(() => useThemeStore());

    // First set to dunkel, then back to schlicht
    act(() => {
      result.current.setTheme('dunkel');
    });
    act(() => {
      result.current.setTheme('schlicht');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('modern')).toBe(false);
  });

  it('should save theme to localStorage', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dunkel');
    });

    expect(localStorage.getItem('theme')).toBe('dunkel');
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('theme', 'modern');

    // Reset store to re-initialize from localStorage
    useThemeStore.setState({ theme: 'schlicht' });
    const { result } = renderHook(() => useThemeStore());

    // initTheme reads from localStorage
    act(() => {
      result.current.initTheme();
    });

    expect(result.current.theme).toBe('modern');
    expect(document.documentElement.classList.contains('modern')).toBe(true);
  });

  it('should reset invalid localStorage value to "schlicht"', () => {
    localStorage.setItem('theme', 'invalid-theme');

    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.initTheme();
    });

    expect(result.current.theme).toBe('schlicht');
    expect(localStorage.getItem('theme')).toBe('schlicht');
  });
});
