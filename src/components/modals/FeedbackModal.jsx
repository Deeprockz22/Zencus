import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { submitFeedback, feedbackMessage, feedbackContext } from '../../utils/feedback';
import './feedback-modal.css';

/**
 * FeedbackModal — A quiet, respectful feedback box for Zencus.
 * Transmits directly to the owner via Vercel Resend integration.
 */
export default function FeedbackModal({ isOpen, onClose, theme = '', skin = '' }) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot bot trap
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef(null);
  const cardRef = useRef(null);
  const closeTimerRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setEmail('');
      setWebsite('');
      setStatus('idle');
      setErrorMessage('');
      const opener = document.activeElement;           // give focus back to it afterwards
      const timer = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimerRef.current);           // no late "thank-you" close after we're gone
        if (opener && typeof opener.focus === 'function') opener.focus();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Captured and stopped here: Settings (underneath) also listens for Escape on window,
        // and one press must close only the topmost window.
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab' && cardRef.current) {
        // aria-modal: keep Tab inside the box
        const items = [...cardRef.current.querySelectorAll('textarea, input:not([tabindex="-1"]), button')]
          .filter((el) => !el.disabled);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage(feedbackMessage('message_required'));
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    const context = feedbackContext(theme);
    const result = await submitFeedback({
      message: message.trim(),
      email: email.trim(),
      website: website.trim(),
      context,
    });

    if (result.ok) {
      setStatus('sent');
      closeTimerRef.current = setTimeout(onClose, 1800);
    } else {
      setStatus('error');
      setErrorMessage(feedbackMessage(result.error));
    }
  };

  return (
    <div className="feedback-modal-backdrop" data-skin={skin || undefined} onClick={onClose} role="presentation">
      <div
        ref={cardRef}
        className="feedback-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <div className="feedback-modal-header">
          <div className="feedback-title-group">
            <MessageSquare size={18} className="feedback-icon" aria-hidden="true" />
            <h3 id="feedback-title" className="feedback-title">Feedback & Thoughts</h3>
          </div>
          <button
            type="button"
            className="feedback-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="feedback-sent-state">
            <CheckCircle2 size={36} className="feedback-check-icon" aria-hidden="true" />
            <h4>Thank you</h4>
            <p>Your note has been delivered quietly to the creator.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <p className="feedback-lede">
              Found a bug, have an idea, or want to share how Zencus fits your work?
            </p>

            {status === 'error' && errorMessage && (
              <div className="feedback-error-banner" role="alert">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <label htmlFor="fb-message" className="sr-only">Your message</label>
            <textarea
              id="fb-message"
              ref={textareaRef}
              className="feedback-textarea"
              placeholder="What's on your mind?..."
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                // Cmd/Ctrl + Enter sends; a plain Enter is just a new line
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && status !== 'sending') handleSubmit(e);
              }}
              disabled={status === 'sending'}
              required
            />

            <label htmlFor="fb-email" className="feedback-email-label">
              Reply address (optional)
            </label>
            <input
              id="fb-email"
              type="email"
              className="feedback-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending'}
            />

            {/* Hidden honeypot field to trap bots */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="fb-website">Website</label>
              <input
                id="fb-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="feedback-actions">
              <button
                type="button"
                className="feedback-cancel-btn"
                onClick={onClose}
                disabled={status === 'sending'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="feedback-submit-btn"
                disabled={status === 'sending' || !message.trim()}
              >
                {status === 'sending' ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Send Note</span>
                    <Send size={14} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
