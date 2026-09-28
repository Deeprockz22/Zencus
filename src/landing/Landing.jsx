import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import {
  ArrowRight,
  ArrowDown,
  Lock,
  Music,
  Maximize2,
  Keyboard,
  Lightbulb,
  Check
} from 'lucide-react';
import FocusLogo from '../components/brand/FocusLogo';
import FlipText from '../components/ui/FlipText';
import MagnetButton from '../components/react-bits/MagnetButton';
import './landing.css';

// Paths follow Vite's base, so the page works at the site root in dev and under
// /Zencus/ on GitHub Pages (base is './' in vite.config.js)
const BASE = import.meta.env.BASE_URL;
const APP_URL = BASE;
const shot = (name) => `${BASE}landing/${name}`;

const MODES = [
  { id: 'focus', label: 'Focus', minutes: 25 },
  { id: 'short', label: 'Short break', minutes: 5 },
  { id: 'long', label: 'Long break', minutes: 15 }
];

const THEMES = [
  { name: 'Crisp', line: 'Quiet, light and precise. The default.', img: shot('crisp-timer.jpg') },
  { name: 'Surreal', line: 'A Magritte sky with a dream-portal clock.', img: shot('surreal.jpg') },
  { name: 'Lantern Garden', line: 'Night blossoms, a paper lantern and a visiting butterfly.', img: shot('lantern.jpg') },
  { name: 'Komorebi', line: 'Sunlight through leaves, and a cat asleep on the floor.', img: shot('komorebi.jpg') }
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const format = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

// Link with the cursor.com-style underline sweep and arrow (after Skiper UI's Link001)
function SweepLink({ href, children, className = '' }) {
  return (
    <a href={href} className={`lp-link ${className}`}>
      <span>{children}</span>
      <svg viewBox="0 0 10 10" aria-hidden="true" className="lp-link-arrow">
        <path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </a>
  );
}

function PrimaryCta({ children }) {
  return (
    <MagnetButton className="lp-btn lp-btn-primary" magnetStrength={0.25} onClick={() => (window.location.href = APP_URL)}>
      <span>{children}</span>
      <ArrowRight size={16} aria-hidden="true" />
    </MagnetButton>
  );
}

// A real, working Pomodoro timer: the hero is the product
function HeroTimer() {
  const [modeId, setModeId] = useState('focus');
  const mode = MODES.find((m) => m.id === modeId);
  const total = mode.minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const done = left === 0;

  useEffect(() => {
    if (!running || left === 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);

  const pickMode = (id) => {
    const next = MODES.find((m) => m.id === id);
    setModeId(id);
    setLeft(next.minutes * 60);
    setRunning(false);
  };

  const primary = () => {
    if (done) {
      setLeft(total);
      setRunning(false);
    } else {
      setRunning((r) => !r);
    }
  };

  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - left / total;

  return (
    <div className="lp-timer" aria-label="Try the timer">
      <div className="lp-segmented" role="group" aria-label="Session type">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={m.id === modeId ? 'is-active' : ''}
            aria-pressed={m.id === modeId}
            onClick={() => pickMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="lp-dial">
        <svg viewBox="0 0 260 260" className="lp-dial-ring" aria-hidden="true">
          <circle cx="130" cy="130" r={radius} className="lp-dial-track" />
          <circle
            cx="130"
            cy="130"
            r={radius}
            className="lp-dial-progress"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 130 130)"
          />
        </svg>
        <div className="lp-dial-center">
          <FlipText className="lp-dial-time" text={format(left)} />
          <span className="lp-dial-state">{done ? 'Done. Nice work.' : running ? mode.label : 'Ready'}</span>
        </div>
      </div>

      <button type="button" className={`lp-btn lp-timer-btn ${running && !done ? 'is-running' : ''}`} onClick={primary}>
        {done ? 'Again' : running ? 'Pause' : 'Start'}
      </button>
      <p className="lp-timer-note">This timer is real. Press start.</p>
    </div>
  );
}

function MiniRing() {
  return (
    <div className="lp-mini lp-mini-ring" aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" className="lp-dial-track" />
        <circle cx="40" cy="40" r="32" className="lp-dial-progress" strokeDasharray="201" strokeDashoffset="60" transform="rotate(-90 40 40)" />
      </svg>
      <span>17:32</span>
    </div>
  );
}

function MiniNote() {
  return (
    <div className="lp-mini lp-mini-note" aria-hidden="true">
      <span className="lp-mini-title">Focus log · 25 min</span>
      <span className="lp-mini-body">Done: cleaned the dataset.</span>
      <span className="lp-mini-tag">#focuslog</span>
    </div>
  );
}

function MiniTask() {
  return (
    <div className="lp-mini lp-mini-task" aria-hidden="true">
      <span className="lp-mini-check" />
      <span>Train the small model</span>
    </div>
  );
}

export default function Landing() {
  // Smooth, inertial scrolling (Lenis), off for people who ask for less motion
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    return () => lenis.destroy();
  }, []);

  // Sections ease in as they arrive
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      <a className="lp-skip" href="#main">Skip to content</a>

      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#top" className="lp-brand" aria-label="Zencus home">
            <FocusLogo size={26} />
            <span>Zencus</span>
          </a>
          <nav className="lp-nav-links" aria-label="Sections">
            <SweepLink href="#loop">The loop</SweepLink>
            <SweepLink href="#features">Features</SweepLink>
            <SweepLink href="#themes">Themes</SweepLink>
            <SweepLink href="#privacy">Privacy</SweepLink>
          </nav>
          <a className="lp-btn lp-btn-small" href={APP_URL}>
            Open Zencus
          </a>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ── */}
        <section id="top" className="lp-hero">
          <div className="lp-aura" aria-hidden="true" />
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">A calm place to do deep work</p>
              <h1 className="lp-display">
                Where <em>zen</em>{' '}
                <br />
                meets focus.
              </h1>
              <p className="lp-lede">
                A Pomodoro timer, a private notebook and a task list that work as one quiet loop. Free, in your
                browser, no account.
              </p>
              <div className="lp-actions">
                <PrimaryCta>Start a focus session</PrimaryCta>
                <SweepLink href="#loop">See how it works</SweepLink>
              </div>
              <ul className="lp-facts">
                <li>No sign-up</li>
                <li>Saved on your device</li>
                <li>Four themes, day and night</li>
              </ul>
            </div>
            <HeroTimer />
          </div>

          <div className="lp-container">
            <figure className="lp-shot lp-shot-hero reveal">
              <picture>
                <source srcSet={shot('crisp-dark.jpg')} media="(prefers-color-scheme: dark)" />
                <img
                  src={shot('crisp-timer.jpg')}
                  width="1440"
                  height="900"
                  alt="The Zencus timer: a 25:00 dot-matrix countdown beside a spinning vinyl record, with the Timer, Tasks and Notes dock at the bottom."
                />
              </picture>
            </figure>
          </div>
        </section>

        {/* ── The loop ── */}
        <section id="loop" className="lp-section">
          <div className="lp-container">
            <header className="lp-section-head reveal">
              <p className="lp-eyebrow">The loop</p>
              <h2 className="lp-h2">Focus, reflect, move on.</h2>
              <p className="lp-section-lede">Most apps give you a timer. Zencus connects what happens before, during and after it.</p>
            </header>
            <ol className="lp-loop">
              <li className="lp-loop-step reveal">
                <MiniRing />
                <h3>Focus</h3>
                <p>Pick a length and one aim. The time is the biggest thing on screen. Everything else waits.</p>
              </li>
              <li className="lp-loop-step reveal">
                <MiniNote />
                <h3>Reflect</h3>
                <p>When the bell rings, a short debrief asks what got done. Your answer is saved to your focus log.</p>
              </li>
              <li className="lp-loop-step reveal">
                <MiniTask />
                <h3>Move on</h3>
                <p>Say what's next and it becomes a task, ready for your next session.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="lp-section lp-section-tint">
          <div className="lp-container">
            <header className="lp-section-head reveal">
              <p className="lp-eyebrow">Features</p>
              <h2 className="lp-h2">Small tools, carefully made.</h2>
            </header>
            <div className="lp-bento">
              <article className="lp-card lp-card-wide reveal">
                <div className="lp-card-text">
                  <Lock size={18} aria-hidden="true" />
                  <h3>Notes that stay private</h3>
                  <p>
                    Write in rich text, sketch, add checklists and #tags. Lock a note with a PIN and it's encrypted on
                    your device.
                  </p>
                </div>
                <img
                  className="lp-card-img"
                  src={shot('crisp-notes.jpg')}
                  width="1440"
                  height="900"
                  loading="lazy"
                  alt="The Notes page: folders on the left and note cards, including a PIN-protected diary."
                />
              </article>
              <article className="lp-card reveal">
                <Lightbulb size={18} aria-hidden="true" />
                <h3>Park stray thoughts</h3>
                <p>Press P, jot the thought down, get back to work. It's waiting for you after the session.</p>
              </article>
              <article className="lp-card reveal">
                <Music size={18} aria-hidden="true" />
                <h3>Sound that settles you</h3>
                <p>Lo-fi jazz, rain and binaural soundscapes, plus 12 packs of soft interface sounds.</p>
              </article>
              <article className="lp-card reveal">
                <Maximize2 size={18} aria-hidden="true" />
                <h3>Full screen, or floating</h3>
                <p>Press F for a distraction-free full screen, or pop the timer into a small window that stays on top.</p>
              </article>
              <article className="lp-card lp-card-keys reveal">
                <Keyboard size={18} aria-hidden="true" />
                <h3>Made for the keyboard</h3>
                <ul className="lp-keys">
                  <li><kbd>F</kbd> Full screen</li>
                  <li><kbd>P</kbd> Park a thought</li>
                  <li><kbd>D</kbd> Count a distraction</li>
                  <li><kbd>?</kbd> Every shortcut</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── Themes ── */}
        <section id="themes" className="lp-section">
          <div className="lp-container">
            <header className="lp-section-head reveal">
              <p className="lp-eyebrow">Themes</p>
              <h2 className="lp-h2">Four worlds, each with a day and a night.</h2>
              <p className="lp-section-lede">Pick the room you want to work in. The timer changes with it.</p>
            </header>
          </div>
          <div className="lp-themes" role="list">
            {THEMES.map((t) => (
              <figure key={t.name} className="lp-theme reveal" role="listitem">
                <img src={t.img} width="1440" height="900" loading="lazy" alt={`Zencus in the ${t.name} theme.`} />
                <figcaption>
                  <strong>{t.name}</strong>
                  <span>{t.line}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Privacy ── */}
        <section id="privacy" className="lp-section lp-section-dark">
          <div className="lp-container">
            <header className="lp-section-head reveal">
              <p className="lp-eyebrow">Privacy</p>
              <h2 className="lp-h2">Your notes stay yours.</h2>
            </header>
            <div className="lp-privacy">
              <div className="reveal">
                <Check size={18} aria-hidden="true" />
                <h3>No account</h3>
                <p>Open it and start. There's nothing to sign up for.</p>
              </div>
              <div className="reveal">
                <Check size={18} aria-hidden="true" />
                <h3>Saved on your device</h3>
                <p>Notes, tasks and your focus history live in your browser. Zencus has no server to send them to.</p>
              </div>
              <div className="reveal">
                <Check size={18} aria-hidden="true" />
                <h3>Locked means encrypted</h3>
                <p>A locked note is encrypted with your PIN. Without the PIN it can't be read, so pick one you'll remember.</p>
              </div>
            </div>
            <p className="lp-privacy-note reveal">A few extras, like the live radio and daily quotes, load from the web.</p>
          </div>
        </section>

        {/* ── Final call ── */}
        <section className="lp-section lp-final">
          <div className="lp-container reveal">
            <h2 className="lp-display lp-display-sm">
              Twenty-five minutes.{' '}
              <br />
              <em>Start now.</em>
            </h2>
            <div className="lp-actions lp-actions-center">
              <PrimaryCta>Start a focus session</PrimaryCta>
            </div>
            <a href="#top" className="lp-top-link">
              <ArrowDown size={14} aria-hidden="true" className="lp-rot" /> Back to top
            </a>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-brand">
            <FocusLogo size={20} />
            <span>Zencus</span>
          </div>
          <p>Where zen meets focus.</p>
          <p className="lp-footer-muted">© {new Date().getFullYear()} Zencus</p>
        </div>
      </footer>
    </div>
  );
}
