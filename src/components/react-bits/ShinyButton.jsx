import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ShinyButton Component from React Bits (reactbits.dev)
 * Combines a sweeping light reflection shimmer effect with subtle
 * magnetic hover attraction and tactile spring depression on click.
 */
export default function ShinyButton({
  children,
  onClick,
  variant = 'default', // 'default' | 'primary' | 'pill' | 'active' | 'icon'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  active = false,
  shimmer = true,
  disabled = false,
  className = '',
  title = '',
  ariaLabel = '',
  magnetStrength = 0.25,
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled || !ref.current || magnetStrength === 0) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * magnetStrength, y: middleY * magnetStrength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || (typeof children === 'string' ? children : title)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      whileHover={disabled ? {} : { y: -1.5, scale: 1.02 }}
      whileTap={disabled ? {} : { y: 0.5, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`rb-shiny-btn rb-shiny-btn--${variant} rb-shiny-btn--${size} ${active ? 'rb-shiny-btn--active' : ''} ${className}`}
      style={style}
      {...props}
    >
      {/* Background ambient shimmer sweep */}
      {shimmer && <span className="rb-shiny-shimmer-sweep" aria-hidden="true" />}
      
      {/* Button Content */}
      <span className="rb-shiny-btn-content">
        {icon && <span className="rb-shiny-btn-icon">{icon}</span>}
        {children && <span className="rb-shiny-btn-text">{children}</span>}
      </span>
    </motion.button>
  );
}
