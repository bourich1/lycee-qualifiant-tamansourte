import React, { useEffect, useRef } from 'react';

interface HyperspeedProps {
  speed?: number;
  density?: number;
  color?: string;
}

const Hyperspeed: React.FC<HyperspeedProps> = ({ 
  speed = 1.5, 
  density = 1.2, 
  color = '79, 70, 229' // Tailwind Indigo-600 RGB format for opacity manipulation
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Star properties
    const starsCount = Math.floor((width * height) / 1000) * density;
    const stars: { x: number; y: number; z: number; o: number }[] = [];

    for (let i = 0; i < starsCount; i++) {
        stars.push({
            x: (Math.random() - 0.5) * 3000,
            y: (Math.random() - 0.5) * 3000,
            z: Math.random() * 2000,
            o: Math.random()
        });
    }

    let animationId: number;
    let centerX = width / 2;
    let centerY = height / 2;

    const render = () => {
        // Clear canvas completely every frame because it overlays a light theme
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            // Move star towards the viewer on the Z axis
            star.z -= speed * 15;

            // Reset star to the back if it passes the viewer
            if (star.z <= 0) {
                star.x = (Math.random() - 0.5) * 3000;
                star.y = (Math.random() - 0.5) * 3000;
                star.z = 2000;
            }

            // Calculate 3D to 2D projection
            const fov = 300;
            const x = centerX + star.x * (fov / star.z);
            const y = centerY + star.y * (fov / star.z);

            // Depth calculation for scaling and opacity
            const depthRatio = (2000 - star.z) / 2000;
            const size = Math.max(0.2, depthRatio * 3);

            // Compute the "tail" position of the streak
            // The faster the speed, the longer the streak
            const tailZ = star.z + speed * 40; 
            const tailX = centerX + star.x * (fov / tailZ);
            const tailY = centerY + star.y * (fov / tailZ);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(x, y);
            
            // Opacity increases as it gets closer
            const opacity = Math.min(1, depthRatio * 1.5) * star.o;
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.stroke();
        });

        animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        centerX = width / 2;
        centerY = height / 2;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    };
  }, [speed, density, color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply opacity-25" 
    />
  );
};

export default Hyperspeed;
