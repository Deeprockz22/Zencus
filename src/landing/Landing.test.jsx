import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Landing from './Landing';

vi.mock('lenis', () => ({ default: class { destroy() {} } }));

describe('Landing page', () => {
  afterEach(() => vi.useRealTimers());

  it('leads with the promise and a way into the app', () => {
    render(<Landing />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Where zen meets focus.');
    expect(screen.getAllByRole('button', { name: /Start a focus session/i }).length).toBe(2);
    expect(screen.getByRole('link', { name: 'Open Zencus' })).toHaveAttribute('href', import.meta.env.BASE_URL);
  });

  it('has a hero timer that really counts down, pauses and switches length', () => {
    vi.useFakeTimers();
    render(<Landing />);
    const start = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(start);
    const tick = () => act(() => { vi.advanceTimersByTime(1000); });
    tick(); tick(); tick();
    expect(screen.getByText('24:57')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    tick(); tick();
    expect(screen.getByText('24:57')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Short break' }));
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('every in-page link points at a section that exists', () => {
    const { container } = render(<Landing />);
    const ids = new Set([...container.querySelectorAll('[id]')].map((el) => el.id));
    const anchors = [...container.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href').slice(1));
    expect(anchors.filter((id) => !ids.has(id))).toEqual([]);
  });
});
