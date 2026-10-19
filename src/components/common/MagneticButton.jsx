import React, { useRef, useState } from 'react';

/**
 * Micro-elastic magnetic attraction button (max 4px displacement)
 * Activates only on devices with pointer/mouse support
 */
export default function MagneticButton({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const btnRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.12; // Subtle 12% spring pull
    const deltaY = (e.clientY - centerY) * 0.12;

    // Constrain max movement to 4.5px
    const clampedX = Math.max(-4.5, Math.min(4.5, deltaX));
    const clampedY = Math.max(-4.5, Math.min(4.5, deltaY));

    setOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`
      }}
      className={`magnetic-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
