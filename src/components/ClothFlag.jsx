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

        const velX = (this.x - this.oldX) * 0.98; // Damping
        const velY = (this.y - this.oldY) * 0.98;

        this.oldX = this.x;
        this.oldY = this.y;

        // Apply velocity and gravity
        this.x += velX;
        this.y += velY + 0.3; // Reduced gravity for horizontal flag

        // Horizontal wind effect (wave from left to right)
        const time = Date.now() * 0.002;
        const windStrength = Math.sin(time + this.x * 0.02) * 1.5;
        const verticalWave = Math.cos(time * 1.5 + this.x * 0.03) * 0.8;
        
        this.y += verticalWave;
        this.x += windStrength * 0.3;
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

    // Create cloth - HORIZONTAL orientation with more points
    const rect = canvas.getBoundingClientRect();
    const cols = 40; // More columns for horizontal flag
    const rows = 16; // More rows for better flex
    const flagWidth = Math.min(rect.width * 0.85, 700);
    const flagHeight = 200;
    const spacing = flagWidth / (cols - 1);
    const spacingY = flagHeight / (rows - 1);
    
    const startX = (rect.width - flagWidth) / 2;
    const startY = 40;

    const points = [];
    const sticks = [];

    // Create points grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Pin left edge only (first column)
        const pinned = x === 0;
        points.push(new Point(startX + x * spacing, startY + y * spacingY, pinned));
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

        // Diagonal sticks for more stability
        if (x < cols - 1 && y < rows - 1) {
          sticks.push(new Stick(points[i], points[i + cols + 1]));
          sticks.push(new Stick(points[i + 1], points[i + cols]));
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
          
          if (dist < 60) {
            const force = (60 - dist) / 60;
            p.x += dx * force * 0.15;
            p.y += dy * force * 0.15;
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
    canvas.addEventListener('touchstart', handleMouseDown, { passive: true });
    canvas.addEventListener('touchmove', handleMouseMove, { passive: true });
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
      for (let i = 0; i < 5; i++) {
        points.forEach(p => p.update(delta));
        sticks.forEach(s => s.update());
      }

      // Draw cloth - smooth black
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = 'rgba(0,0,0,0)';

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

          // Triangle 2
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Draw skull and title on cloth center
      const centerCol = Math.floor(cols / 2);
      const centerRow = Math.floor(rows / 2);
      const centerPoint = points[centerRow * cols + centerCol];

      // Calculate average rotation from nearby points for text alignment
      const leftPoint = points[centerRow * cols + centerCol - 2];
      const rightPoint = points[centerRow * cols + centerCol + 2];
      const angle = Math.atan2(rightPoint.y - leftPoint.y, rightPoint.x - leftPoint.x);

      // Skull
      ctx.save();
      ctx.translate(centerPoint.x, centerPoint.y - 35);
      ctx.rotate(angle);
      ctx.font = '56px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('☠️', 0, 0);
      ctx.restore();

      // Title
      ctx.save();
      ctx.translate(centerPoint.x, centerPoint.y + 35);
      ctx.rotate(angle);
      ctx.font = 'bold 38px "Pirata One", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#d4af37';
      ctx.shadowColor = 'rgba(212,175,55,0.8)';
      ctx.shadowBlur = 16;
      ctx.fillText('Isla Calavera', 0, 0);
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
    <div style={{ 
      position: 'relative',
      marginBottom: '24px',
      overflow: 'visible'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '280px',
          display: 'block',
          cursor: 'grab',
          background: 'transparent'
        }}
      />
      {showResetButton && (
        <button
          className="btn btn-danger"
          onClick={onReset}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            fontSize: '0.85rem',
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
