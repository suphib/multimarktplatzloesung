import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AnimatedCounter } from './AnimatedCounter';

describe('AnimatedCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let rafId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafId++;
      setTimeout(() => cb(performance.now()), 16);
      return rafId;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders target value with suffix', () => {
    const { container } = render(<AnimatedCounter zielwert={500} suffix="+" prefix="" dauer={0} />);
    act(() => { vi.advanceTimersByTime(50); });
    expect(container.textContent).toContain('500');
    expect(container.textContent).toContain('+');
  });

  it('renders with prefix', () => {
    const { container } = render(<AnimatedCounter zielwert={3} suffix="s" prefix="<" dauer={0} />);
    act(() => { vi.advanceTimersByTime(50); });
    expect(container.textContent).toMatch(/<.*3.*s/);
  });

  it('renders percentage value', () => {
    const { container } = render(<AnimatedCounter zielwert={99.7} suffix="%" prefix="" dauer={0} />);
    act(() => { vi.advanceTimersByTime(50); });
    expect(container.textContent).toContain('99.7');
    expect(container.textContent).toContain('%');
  });

  it('renders with Mio suffix', () => {
    const { container } = render(<AnimatedCounter zielwert={2} suffix=" Mio+" prefix="" dauer={0} />);
    act(() => { vi.advanceTimersByTime(50); });
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('Mio+');
  });
});
