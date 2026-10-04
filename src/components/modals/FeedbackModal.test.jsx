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
});
