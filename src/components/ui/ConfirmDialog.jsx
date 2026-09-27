import React, { useEffect, useRef } from 'react';
import './confirm-dialog.css';

/**
 * In-app replacement for window.confirm, styled like the rest of the app's dialogs.
 * Escape or the backdrop cancels; focus starts on Cancel so Enter never destroys by accident.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) {
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  // Focus Cancel once per opening; Esc cancels (captured so it doesn't reach dialogs below)
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onCancelRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop confirm-dialog-backdrop" onClick={onCancel}>
      <div
        className="modal-card confirm-dialog-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        {message && <p id="confirm-dialog-message" className="confirm-dialog-message">{message}</p>}
        <div className="confirm-dialog-actions">
          <button ref={cancelRef} type="button" className="btn-action secondary confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn-action primary confirm-dialog-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
