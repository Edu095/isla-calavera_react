import { useEffect, useRef } from 'react';

export function ClothFlag({ onReset, showResetButton }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

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
      }

      update(deltaTime) {
        if (this.pinned) return;

        const friction = 0.995; // Higher = less friction
        const velX = (this.x - this.oldX) * friction;
        const velY = (this.y - this.oldY) * friction;

        this.oldX = this.x;
        this.oldY = this.y;

        // Apply velocity
        this.x += velX;
        this.y += velY;

        // Very light gravity
        this.y += 0.1 * deltaTime;
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

    // Create cloth - HORIZONTAL orientation
    const rect = canvas.getBoundingClientRect();
    const cols = 35;
    const rows = 14;
    const flagWidth = Math.min(rect.width * 0.8, 650);
    const flagHeight = 180;
    const spacing = flagWidth / (cols - 1);
    const spacingY = flagHeight / (rows - 1);
    
    const startX = (rect.width - flagWidth) / 2;
    const startY = 50;

    const points = [];
    const sticks = [];

    // Create points grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Pin left edge
        const pinned = x === 0;
        points.push(new Point(startX + x * spacing, startY + y * spacingY, pinned));
      }
    }

    // Create constraints
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        
        // Horizontal
        if (x < cols - 1) {
          sticks.push(new Stick(points[i], points[i + 1]));
        }
        
        // Vertical
        if (y < rows - 1) {
          sticks.push(new Stick(points[i], points[i + cols]));
        }
      }
    }

    // Wind force simulation
    const applyWind = (time) => {
      points.forEach((p, index) => {
        if (p.pinned) return;
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Horizontal wave from left to right
        const waveOffset = col * 0.15;
        const verticalWave = Math.sin(time * 2 + waveOffset) * 0.8;
        const horizontalWave = Math.cos(time * 1.5 + waveOffset) * 0.4;
        
        // Apply wind force
        p.y += verticalWave;
        p.x += horizontalWave;
      });
    };

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
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      mouseX = pos.x;
      mouseY = pos.y;

      if (isDragging) {
        points.forEach(p => {
          if (p.pinned) return;
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 70) {
            const force = (70 - dist) / 70;
            p.x += dx * force * 0.2;
            p.y += dy * force * 0.2;
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
    canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
    canvas.addEventListener('touchmove', handleMouseMove, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp);

    // Animation loop
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x speed
      lastTime = currentTime;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Apply wind
      applyWind(currentTime * 0.001);

      // Update physics (multiple iterations for stability)
      for (let iteration = 0; iteration < 4; iteration++) {
        points.forEach(p => p.update(deltaTime));
        sticks.forEach(s => s.update());
      }

      // Draw cloth - smooth black
      ctx.fillStyle = '#000000';

      // Draw filled triangles
      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols - 1; x++) {
          const i = y * cols + x;
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + cols];
          const p4 = points[i + cols + 1];

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Draw skull and title
      const centerCol = Math.floor(cols / 2);
      const centerRow = Math.floor(rows / 2);
      const centerPoint = points[centerRow * cols + centerCol];

      // Calculate rotation from nearby points
      const leftPoint = points[centerRow * cols + Math.max(0, centerCol - 3)];
      const rightPoint = points[centerRow * cols + Math.min(cols - 1, centerCol + 3)];
      const angle = Math.atan2(rightPoint.y - leftPoint.y, rightPoint.x - leftPoint.x);

      // Skull
      ctx.save();
      ctx.translate(centerPoint.x, centerPoint.y - 35);
      ctx.rotate(angle);
      ctx.font = '60px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('☠️', 0, 0);
      ctx.restore();

      // Title
      ctx.save();
      ctx.translate(centerPoint.x, centerPoint.y + 40);
      ctx.rotate(angle);
      ctx.font = 'bold 42px "Pirata One", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#d4af37';
      ctx.shadowColor = 'rgba(212,175,55,0.9)';
      ctx.shadowBlur = 18;
      ctx.fillText('Isla Calavera', 0, 0);
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

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
          cursor: isDragging ? 'grabbing' : 'grab',
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
