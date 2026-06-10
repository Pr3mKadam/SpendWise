import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] });
  });

  it('returns the initial target value immediately', () => {
    const { result } = renderHook(() => useCountUp(42));
    expect(result.current).toBe(42);
  });

  it('animates from previous value to new target', () => {
    const { result, rerender } = renderHook(({ val }: { val: number }) => useCountUp(val, 100), {
      initialProps: { val: 0 },
    });
    expect(result.current).toBe(0);

    rerender({ val: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    const mid = result.current;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(100);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(100);
  });

  it('reaches the target after enough time', () => {
    const { result, rerender } = renderHook(({ val }: { val: number }) => useCountUp(val, 50), {
      initialProps: { val: 0 },
    });

    rerender({ val: 500 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(500);
  });

  it('stays at target if value does not change', () => {
    const { result } = renderHook(() => useCountUp(77, 100));
    expect(result.current).toBe(77);
  });
});
