import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackModal from './FeedbackModal';
import * as feedbackUtils from '../../utils/feedback';

vi.mock('../../utils/feedback', async () => {
  const actual = await vi.importActual('../../utils/feedback');
  return {
    ...actual,
    submitFeedback: vi.fn(),
  };
});

describe('FeedbackModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<FeedbackModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog and elements when isOpen is true', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} theme="crisp" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Feedback & Thoughts')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What's on your mind/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Note/i })).toBeInTheDocument();
  });

  it('closes when clicking the close button or pressing Escape', () => {
    const onClose = vi.fn();
    render(<FeedbackModal isOpen={true} onClose={onClose} />);
    
    const closeBtn = screen.getByLabelText(/Close dialog/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('shows error banner when submitting an empty message', async () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} />);
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Write a few words first/i);
    expect(feedbackUtils.submitFeedback).not.toHaveBeenCalled();
  });

  it('submits feedback and shows thank you state on success', async () => {
    feedbackUtils.submitFeedback.mockResolvedValueOnce({ ok: true });
    const onClose = vi.fn();
    render(<FeedbackModal isOpen={true} onClose={onClose} theme="surreal" />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    fireEvent.change(textarea, { target: { value: 'Love the new 3D world!' } });

    const emailInput = screen.getByPlaceholderText('you@domain.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form);

    expect(feedbackUtils.submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Love the new 3D world!',
        email: 'test@example.com',
        website: '',
        context: expect.objectContaining({ theme: 'surreal' }),
      })
    );

    expect(await screen.findByText('Thank you')).toBeInTheDocument();
    expect(screen.getByText(/Your note has been delivered/i)).toBeInTheDocument();
  });

  it('shows error message when submitFeedback fails', async () => {
    feedbackUtils.submitFeedback.mockResolvedValueOnce({ ok: false, error: 'rate_limited' });
    render(<FeedbackModal isOpen={true} onClose={() => {}} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    fireEvent.change(textarea, { target: { value: 'Another quick message' } });

    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form);

    expect(await screen.findByRole('alert')).toHaveTextContent(/You’ve sent a few already/i);
  });

  it('takes a skin so a host page with its own palette (the landing page) can restyle it', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} skin="landing" />);
    expect(document.querySelector('.feedback-modal-backdrop').getAttribute('data-skin')).toBe('landing');
  });

  describe('living inside another window (polish, found testing it in the app)', () => {
    it('Escape closes only the feedback box, not the window underneath', () => {
      const underneath = vi.fn();                       // e.g. Settings, which also listens for Escape
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') underneath(); });
      const onClose = vi.fn();
      render(<FeedbackModal isOpen={true} onClose={onClose} />);
      fireEvent.keyDown(screen.getByPlaceholderText(/What's on your mind/i), { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(underneath).not.toHaveBeenCalled();
    });

    it('hands focus back to whatever opened it', async () => {
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
      const { rerender } = render(<FeedbackModal isOpen={false} onClose={() => {}} />);
      rerender(<FeedbackModal isOpen={true} onClose={() => {}} />);
      await waitFor(() => expect(document.activeElement).toBe(screen.getByPlaceholderText(/What's on your mind/i)));
      rerender(<FeedbackModal isOpen={false} onClose={() => {}} />);
      expect(document.activeElement).toBe(opener);
      opener.remove();
    });

    it('keeps Tab inside the dialog (it is aria-modal)', () => {
      render(<FeedbackModal isOpen={true} onClose={() => {}} />);
      const close = screen.getByLabelText(/Close dialog/i);
      const textarea = screen.getByPlaceholderText(/What's on your mind/i);
      fireEvent.change(textarea, { target: { value: 'hello there' } });
      const send = screen.getByRole('button', { name: /Send Note/i });
      send.focus();
      fireEvent.keyDown(send, { key: 'Tab' });            // past the last control → back to the first
      expect(document.activeElement).toBe(close);
      fireEvent.keyDown(close, { key: 'Tab', shiftKey: true }); // before the first → to the last
      expect(document.activeElement).toBe(send);
    });

    it('sends with Cmd/Ctrl + Enter from the message box', async () => {
      feedbackUtils.submitFeedback.mockResolvedValue({ ok: true });
      render(<FeedbackModal isOpen={true} onClose={() => {}} />);
      const textarea = screen.getByPlaceholderText(/What's on your mind/i);
      fireEvent.change(textarea, { target: { value: 'Lovely cat' } });
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      await waitFor(() => expect(feedbackUtils.submitFeedback).toHaveBeenCalledTimes(1));
      fireEvent.keyDown(textarea, { key: 'Enter' });       // a plain Enter just makes a new line
      expect(feedbackUtils.submitFeedback).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose after it has been closed or unmounted (the thank-you timer)', async () => {
      vi.useFakeTimers();
      feedbackUtils.submitFeedback.mockResolvedValue({ ok: true });
      const onClose = vi.fn();
      const { unmount } = render(<FeedbackModal isOpen={true} onClose={onClose} />);
      fireEvent.change(screen.getByPlaceholderText(/What's on your mind/i), { target: { value: 'thanks' } });
      fireEvent.click(screen.getByRole('button', { name: /Send Note/i }));
      await vi.advanceTimersByTimeAsync(10);
      unmount();
      await vi.advanceTimersByTimeAsync(3000);
      expect(onClose).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
