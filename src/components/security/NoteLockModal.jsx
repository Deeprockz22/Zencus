import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, Delete } from 'lucide-react';

/**
 * 4-digit PIN prompt.
 * - set: asks twice, so a typo can't lock you out; onSuccess(pin) once both match.
 * - unlock / remove: verifyPin(pin) resolves true or false (it may decrypt the note);
 *   onSuccess(pin) runs on a match.
 */
export default function NoteLockModal({
  isOpen,
  mode = 'unlock', // 'set' | 'unlock' | 'remove'
  onClose,
  onSuccess,
  verifyPin
}) {
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState(null); // set mode: the entry waiting to be confirmed
  const [errorMsg, setErrorMsg] = useState('');
  const [checking, setChecking] = useState(false);
  // Refs mirror the state so digits typed faster than React re-renders are never lost
  const pinRef = useRef('');
  const firstPinRef = useRef(null);
  const checkingRef = useRef(false);

  const updatePin = (value) => {
    pinRef.current = value;
    setPin(value);
  };
  const updateFirstPin = (value) => {
    firstPinRef.current = value;
    setFirstPin(value);
  };

  // Every way out clears the prompt, so the next one starts empty
  const reset = () => {
    updatePin('');
    updateFirstPin(null);
    setErrorMsg('');
    setChecking(false);
    checkingRef.current = false;
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async (enteredPin) => {
    if (mode === 'set') {
      if (firstPinRef.current === null) {
        updateFirstPin(enteredPin);
        updatePin('');
      } else if (enteredPin === firstPinRef.current) {
        onSuccess(enteredPin);
        close();
      } else {
        updateFirstPin(null);
        updatePin('');
        setErrorMsg("PINs didn't match. Start again.");
      }
      return;
    }

    checkingRef.current = true;
    setChecking(true);
    const ok = verifyPin ? await verifyPin(enteredPin) : false;
    checkingRef.current = false;
    setChecking(false);
    if (ok) {
      onSuccess(enteredPin);
      close();
    } else {
      setErrorMsg('Incorrect PIN. Try again.');
      updatePin('');
    }
  };

  const handleDigit = (digit) => {
    if (checkingRef.current || pinRef.current.length >= 4) return;
    const newPin = pinRef.current + digit;
    updatePin(newPin);
    setErrorMsg('');
    if (newPin.length === 4) submit(newPin);
  };

  const handleBackspace = () => {
    if (checkingRef.current) return;
    updatePin(pinRef.current.slice(0, -1));
    setErrorMsg('');
  };

  // Keyboard entry. preventDefault keeps the keystroke from also being typed into
  // whatever takes focus once the PIN is accepted (e.g. the note title).
  // The listener is registered once per opening and always calls the latest handler.
  const keyHandlerRef = useRef(null);
  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };
  });

  useEffect(() => {
    if (!isOpen) return;
    const listener = (e) => keyHandlerRef.current?.(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [isOpen]);

  const title =
    mode === 'set' ? (firstPin === null ? 'Set a 4-Digit PIN' : 'Confirm your PIN') : mode === 'remove' ? 'Remove Lock' : 'Protected Note';
  const subtitle =
    mode === 'set'
      ? firstPin === null
        ? 'The note is encrypted on this device. There is no way to recover a forgotten PIN.'
        : 'Enter the same 4 digits again'
      : mode === 'remove'
        ? 'Enter the PIN to remove the lock from this note'
        : 'Enter your 4-digit PIN to view and edit this note';

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal-card pin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="pin-header-icon">
            <Lock size={20} className="lock-icon-glow" />
          </div>
          <button className="icon-btn close-modal-btn" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="pin-modal-body">
          <h3 className="pin-title">{title}</h3>
          <p className="pin-subtitle">{checking ? 'Checking…' : subtitle}</p>

          {/* PIN Dots Indicator */}
          <div className="pin-dots-container">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`pin-dot ${pin.length > i ? 'filled' : ''} ${errorMsg ? 'error' : ''}`}
              />
            ))}
          </div>

          {errorMsg && <p className="pin-error-text">{errorMsg}</p>}

          {/* Numeric Keypad */}
          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                className="keypad-btn"
                onClick={() => handleDigit(num.toString())}
              >
                {num}
              </button>
            ))}
            <button type="button" className="keypad-btn empty" disabled></button>
            <button
              type="button"
              className="keypad-btn"
              onClick={() => handleDigit('0')}
            >
              0
            </button>
            <button
              type="button"
              className="keypad-btn backspace flex items-center justify-center"
              onClick={handleBackspace}
              aria-label="Backspace"
            >
              <Delete size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
