import { gsap } from 'gsap';

/**
 * GSAP Motion Utilities
 * Ultra-high performance kinetic micro-interactions powered by GreenSock Animation Platform.
 */

export const gsapMotion = {
  /**
   * Pulse an element with subtle elastic scale and glow
   */
  pulse(target, options = {}) {
    if (!target) return;
    const { scale = 1.05, duration = 0.45, ease = 'back.out(2)' } = options;
    return gsap.fromTo(
      target,
      { scale: 1 },
      {
        scale,
        duration: duration / 2,
        ease,
        yoyo: true,
        repeat: 1,
        clearProps: 'transform'
      }
    );
  },

  /**
   * Numerical rolling digit transition
   */
  rollDigits(target, fromVal, toVal, options = {}) {
    if (!target) return;
    const { duration = 0.8, ease = 'power2.out', onUpdate } = options;
    const obj = { val: fromVal };
    return gsap.to(obj, {
      val: toVal,
      duration,
      ease,
      onUpdate: () => {
        const rounded = Math.round(obj.val);
        if (target.innerText !== undefined) {
          target.innerText = String(rounded);
        }
        if (onUpdate) onUpdate(rounded);
      }
    });
  },

  /**
   * Smooth entrance stagger for arrays of elements
   */
  staggerEntrance(targets, options = {}) {
    if (!targets || targets.length === 0) return;
    const { y = 16, opacity = 0, stagger = 0.06, duration = 0.4, ease = 'power3.out' } = options;
    return gsap.from(targets, {
      y,
      opacity,
      stagger,
      duration,
      ease,
      clearProps: 'all'
    });
  }
};
