import React, { useEffect, useRef } from 'react';

interface GhostCursorProps {
  color?: string;
  trailLength?: number;
  size?: number;
  // Additional props to maintain compatibility with your original request
  inertia?: number;
  grainIntensity?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  brightness?: number;
  edgeIntensity?: number;
}

const GhostCursor: React.FC<GhostCursorProps> = ({
  color = '#B19EEF',
  trailLength = 30,
  size = 8,
  inertia = 0.3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const dots = useRef(
    Array.from({ length: trailLength }).map(() => ({
      x: -100,
      y: -100,
    }))
  );

  useEffect(() => {
    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // If we're inside a relative parent, using clientX/Y works best if the cursor is `fixed`.
      // If absolute, checking the bounding box of the parent is needed.
      // Since we use fixed positioning for the particles to work globally, clientX/Y is perfect.
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      let x = mouse.current.x;
      let y = mouse.current.y;

      dots.current.forEach((dot, index) => {
        // Dot follows the previous position smoothly
        dot.x += (x - dot.x) * inertia;
        dot.y += (y - dot.y) * inertia;

        const node = dotsRef.current[index];
        if (node) {
          // Calculate fading and scaling
          const progress = index / trailLength;
          const scale = 1 + progress * 0.8; // Scale up slightly at the end
          const opacity = Math.max(0, 1 - progress);
          
          node.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) scale(${scale})`;
          node.style.opacity = opacity.toString();
        }

        // Pass this dot's modified position to the next dot in the trail
        x = dot.x;
        y = dot.y;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trailLength, inertia]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {Array.from({ length: trailLength }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (dotsRef.current[i] = el)}
          className="absolute rounded-full will-change-transform"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            top: -size / 2, // Center the dot on the cursor
            left: -size / 2,
            boxShadow: `0 0 ${size * 1.5}px ${color}, 0 0 ${size}px ${color}`,
          }}
        />
      ))}
    </div>
  );
};

export default GhostCursor;
