import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ClothFlag({ onReset, showResetButton }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const width = containerRef.current.clientWidth;
    const height = 400;
    
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.set(0, 0, 60);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 50, 100);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    // Flag geometry
    const flagWidth = 50;
    const flagHeight = 32;
    const segmentsW = 40;
    const segmentsH = 25;

    const geometry = new THREE.PlaneGeometry(
      flagWidth, 
      flagHeight, 
      segmentsW, 
      segmentsH
    );

    // Create canvas texture with skull and title
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw skull
    ctx.font = 'bold 180px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('☠️', canvas.width / 2, canvas.height / 2 - 80);

    // Draw title
    ctx.font = 'bold 120px "Pirata One", cursive';
    ctx.fillStyle = '#d4af37';
    ctx.shadowColor = 'rgba(212,175,55,0.8)';
    ctx.shadowBlur = 25;
    ctx.fillText('Isla Calavera', canvas.width / 2, canvas.height / 2 + 100);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const flag = new THREE.Mesh(geometry, material);
    scene.add(flag);

    sceneRef.current = { scene, camera, renderer, flag, geometry };

    // Wave animation parameters
    const waveParams = {
      horizontal: 0.4,
      vertical: 0.3,
      swing: 0.25,
      speed: 0.4
    };

    // Store original vertex positions
    const originalPositions = [];
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      originalPositions.push({
        x: geometry.attributes.position.getX(i),
        y: geometry.attributes.position.getY(i),
        z: geometry.attributes.position.getZ(i)
      });
    }

    // Animation loop
    const animate = () => {
      const time = Date.now() * waveParams.speed / 50;

      // Update vertices for wave effect
      for (let y = 0; y <= segmentsH; y++) {
        for (let x = 0; x <= segmentsW; x++) {
          const index = x + y * (segmentsW + 1);
          const original = originalPositions[index];
          
          // Calculate wave - REMOVED the x/4 multiplier to allow left edge to move
          const waveX = waveParams.horizontal * x;
          const waveY = waveParams.vertical * y;
          
          // Base wave calculation
          const baseWave = Math.sin(waveX + waveY - time) * waveParams.swing;
          
          // Apply progressive amplitude (still increases from left to right but left moves too)
          const progressiveAmplitude = 0.3 + (x / segmentsW) * 0.7; // 30% at left, 100% at right
          const z = baseWave * progressiveAmplitude;
          
          // Update vertex position
          geometry.attributes.position.setZ(index, z);
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative',
      marginBottom: '24px',
      overflow: 'visible'
    }}>
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '400px',
          display: 'block'
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
