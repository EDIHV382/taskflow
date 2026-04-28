import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    // Change value
    rerender({ value: 'changed', delay: 100 });

    // Value should still be initial (not debounced yet)
    expect(result.current).toBe('initial');

    // Wait for debounce
    await waitFor(() => {
      expect(result.current).toBe('changed');
    });
  });

  it('resets timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    // Make multiple rapid changes
    rerender({ value: 'change1', delay: 100 });
    rerender({ value: 'change2', delay: 100 });
    rerender({ value: 'change3', delay: 100 });

    // Should still be initial
    expect(result.current).toBe('initial');

    // Wait for debounce after last change
    await waitFor(() => {
      expect(result.current).toBe('change3');
    });
  });

  it('works with numbers', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 50 },
      }
    );

    rerender({ value: 42, delay: 50 });

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('works with objects', async () => {
    const initialObj = { count: 0 };
    const newObj = { count: 5 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 50 },
      }
    );

    rerender({ value: newObj, delay: 50 });

    await waitFor(() => {
      expect(result.current).toEqual(newObj);
    });
  });
});
