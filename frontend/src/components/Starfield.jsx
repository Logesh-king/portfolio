import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = null;
    let stars = [];
    const starCount = 450; // Performance friendly count

    const initializeStars = () => {
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.3,
        speed: 0.01 + Math.random() * 0.015,
        angle: Math.random() * Math.PI * 2,
      }));
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars();
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.x += Math.sin(s.angle) * s.speed;
        s.y += Math.cos(s.angle) * s.speed * 0.3;

        if (s.x > canvas.width) s.x = 0;
        if (s.x < 0) s.x = canvas.width;
        if (s.y > canvas.height) s.y = 0;
        if (s.y < 0) s.y = canvas.height;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + Math.random() * 0.35})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(drawStars);
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();
    drawStars();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas id="stars-canvas" ref={canvasRef} aria-hidden="true" />;
}
