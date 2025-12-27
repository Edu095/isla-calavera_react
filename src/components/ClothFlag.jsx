import { useEffect, useRef } from 'react';

export function ClothFlag({ onReset, showResetButton }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const clothRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();

    // Cloth physics
    class Point {
      constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
        this.mass = 1;
      }

      update(delta) {
        if (this.pinned) return;

        const velX = (this.x - this.oldX) * 0.99; // Damping
        const velY = (this.y - this.oldY) * 0.99;

        this.oldX = this.x;
        this.oldY = this.y;

        // Apply velocity and gravity
        this.x += velX;
        this.y += velY + 0.5; // Gravity

        // Wind effect (subtle wave)
        const windForce = Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.3;
        this.x += windForce;

        // Boundaries
        const rect = canvas.getBoundingClientRect();
        if (this.y > rect.height - 5) {
          this.y = rect.height - 5;
          this.oldY = this.y + velY * 0.5;
        }
      }

      constrain(other, distance) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 0.1) return;

        const diff = (distance - dist) / dist;
        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;

        if (!this.pinned) {
          this.x -= offsetX;
          this.y -= offsetY;
        }
        if (!other.pinned) {
          other.x += offsetX;
          other.y += offsetY;
        }
      }
    }

    class Stick {
      constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        this.length = Math.sqrt(dx * dx + dy * dy);
      }

      update() {
        this.p1.constrain(this.p2, this.length);
      }
    }

    // Create cloth
    const cols = 20;
    const rows = 12;
    const spacing = 25;
    const startX = 20;
    const startY = 20;

    const points = [];
    const sticks = [];

    // Create points grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const pinned = y === 0; // Pin top row
        points.push(new Point(startX + x * spacing, startY + y * spacing, pinned));
      }
    }

    // Create constraints (sticks)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        
        // Horizontal stick
        if (x < cols - 1) {
          sticks.push(new Stick(points[i], points[i + 1]));
        }
        
        // Vertical stick
        if (y < rows - 1) {
          sticks.push(new Stick(points[i], points[i + cols]));
        }
      }
    }

    clothRef.current = { points, sticks };

    // Mouse interaction
    let mouseX = -1000;
    let mouseY = -1000;
    let isDragging = false;

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left,
        y: (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top
      };
    };

    const handleMouseDown = (e) => {
      isDragging = true;
      const pos = getMousePos(e);
      mouseX = pos.x;
      mouseY = pos.y;
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      mouseX = pos.x;
      mouseY = pos.y;

      if (isDragging) {
        // Pull cloth with mouse
        points.forEach(p => {
          if (p.pinned) return;
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 50) {
            const force = (50 - dist) / 50;
            p.x += dx * force * 0.1;
            p.y += dy * force * 0.1;
          }
        });
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);

    // Animation loop
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 16.67; // Normalize to 60fps
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Update physics (multiple iterations for stability)
      for (let i = 0; i < 3; i++) {
        points.forEach(p => p.update(delta));
        sticks.forEach(s => s.update());
      }

      // Draw cloth
      ctx.fillStyle = '#0a0a0a';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;

      // Draw filled triangles
      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols - 1; x++) {
          const i = y * cols + x;
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + cols];
          const p4 = points[i + cols + 1];

          // Triangle 1
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Triangle 2
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // Draw skull and title on cloth
      const centerCol = Math.floor(cols / 2);
      const centerRow = Math.floor(rows / 2);
      const centerPoint = points[centerRow * cols + centerCol];

      // Skull
      ctx.save();
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('☠️', centerPoint.x, centerPoint.y - 30);
      ctx.restore();

      // Title
      ctx.save();
      ctx.font = 'bold 32px "Pirata One", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#d4af37';
      ctx.shadowColor = 'rgba(212,175,55,0.6)';
      ctx.shadowBlur = 12;
      ctx.fillText('Isla Calavera', centerPoint.x, centerPoint.y + 30);
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          cursor: 'grab',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      />
      {showResetButton && (
        <button
          className="btn btn-danger"
          onClick={onReset}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            fontSize: '0.9rem',
            padding: '8px 16px',
            zIndex: 10
          }}
          title="Empezar una nueva partida desde cero"
        >
          🔄 Nueva Partida
        </button>
      )}
    </div>
  );
}
