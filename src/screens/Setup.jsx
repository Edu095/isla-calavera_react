import { useState, useRef, useEffect } from 'react';
import { FORTUNE } from '../engine/constants.js';

const TIPS = [
  {
    emoji: '🎲',
    title: '¿Cómo se juega?',
    content: [
      'Lanza 8 dados por turno',
      'Suma puntos según la carta de acción',
      '3 calaveras = muerte (pierdes puntos del turno)',
      'Primer jugador en 6000 puntos gana'
    ]
  },
  {
    emoji: '🎴',
    title: 'Cartas de Acción',
    content: [
      'Cada turno se revela una carta',
      'Las cartas multiplican ciertos dados',
      'Sables, Pistolas, Diamantes valen 100 cada uno',
      'Monedas y Loros también puntúan'
    ]
  },
  {
    emoji: '💀',
    title: 'Isla Calavera',
    content: [
      '4+ calaveras en la primera tirada activa el modo',
      'El jugador activo no puntúa',
      'Los demás pierden 100 puntos por calavera',
      'Con carta Pirata: 200 puntos por calavera'
    ]
  },
  {
    emoji: '📦',
    title: 'Carta Botín',
    content: [
      'Puedes guardar dados antes de la 3ª calavera',
      'Si mueres, sólo puntúan los dados guardados',
      'No se pueden guardar calaveras',
      'Estrategia avanzada para jugadores expertos'
    ]
  },
  {
    emoji: '🌐',
    title: 'Juega Online',
    content: [
      '¿Quieres jugar contra otros piratas?',
      'Board Game Arena ofrece versión online gratuita',
      'Juega desde tu navegador sin descargas',
      'Miles de jugadores de todo el mundo'
    ],
    hasButton: true,
    buttonText: '🎮 Jugar en Board Game Arena',
    buttonUrl: 'https://boardgamearena.com/gamepanel?game=piratenkapern'
  }
];

export function Setup({ state, dispatch }){
  const [cards, setCards] = useState(TIPS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Bloquear scroll del body cuando se está arrastrando
  useEffect(() => {
    if (isDragging) {
      // Prevenir scroll en móviles y desktop
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging]);

  const handleStart = (clientX, clientY, e) => {
    // Prevenir si es un botón o enlace
    if (e.target.closest('.btn') || e.target.closest('a')) return;
    
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setOffset({ x: 0, y: 0 });
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging || isAnimating) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging || isAnimating) return;
    
    const threshold = 100;
    const absX = Math.abs(offset.x);

    if (absX > threshold) {
      // Activar animación de salida
      setIsAnimating(true);
      
      // Dirección del swipe
      const direction = offset.x > 0 ? 1 : -1;
      
      // Animar hacia fuera
      setOffset({ 
        x: direction * window.innerWidth, 
        y: offset.y 
      });
      
      // Mover carta al final después de la animación
      setTimeout(() => {
        setOffset({ x: 0, y: 0 });
        setIsAnimating(false);
        setCards(prev => {
          const newCards = [...prev];
          const topCard = newCards.shift();
          newCards.push(topCard);
          return newCards;
        });
        setCurrentCardIndex((prev) => (prev + 1) % TIPS.length);
      }, 300);
    } else {
      // Volver a la posición original con animación
      setOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  // Event handlers para touch
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY, e);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Event handlers para mouse
  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY, e);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Config Card */}
      <div className="wooden-box fade-in">
        <h2>⚙️ Configuración de Partida</h2>
        
        <label>Modo de Juego</label>
        <div className="row" style={{ marginBottom: '24px' }}>
          <button
            className={`btn ${state.mode === 'normal' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'normal' })}
            style={{ flex: 1 }}
          >
            <span>😊</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <span style={{ fontWeight: 600 }}>FÁCIL</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Mín: 0 puntos</span>
            </div>
          </button>
          <button
            className={`btn ${state.mode === 'hardcore' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'hardcore' })}
            style={{ flex: 1 }}
          >
            <span>💀</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <span style={{ fontWeight: 600 }}>HARDCORE</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Permite negativos</span>
            </div>
          </button>
        </div>

        <label>Número de Piratas</label>
        <div className="row" style={{ marginBottom: '24px' }}>
          {[2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`btn ${state.numPlayers === n ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => dispatch({ type: 'SET_NUM_PLAYERS', numPlayers: n })}
              style={{ 
                flex: 1,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="notice good">
          <div className="kv">
            <span>Modo seleccionado</span>
            <b>{state.mode === 'normal' ? '😊 Fácil' : '💀 Hardcore'}</b>
          </div>
          <div className="kv">
            <span>Jugadores</span>
            <b>🏴‍☠️ {state.numPlayers} piratas</b>
          </div>
        </div>

        <div className="right">
          <button 
            className="btn btn-secondary" 
            onClick={() => dispatch({ type: 'GO_NAMES' })}
            style={{ fontSize: '1.1rem' }}
          >
            ⛵ Continuar
          </button>
        </div>
      </div>

      {/* Card Stack - Guía Rápida */}
      <div className="wooden-box wooden-box-dark fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)', textAlign: 'center' }}>
          📚 Guía Rápida
        </h2>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem', 
          marginBottom: '24px' 
        }}>
          Desliza las cartas para ver más →
        </p>

        <div 
          className="card-stack-wrapper"
          style={{
            position: 'relative',
            width: '100%',
            height: '450px',
            perspective: '1200px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: isDragging ? 'none' : 'pan-y',
            overflow: 'hidden'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="card-stack" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {cards.map((tip, index) => {
              const isTopCard = index === 0;
              const zIndex = cards.length - index;
              
              // Escalado para efecto de stack - más pronunciado
              const scale = 1 - (index * 0.05);
              const yOffset = index * 15;
              
              // Opacidad visible para el stack
              let opacity = 1;
              if (index > 2) opacity = 0;
              
              // Transformación para la carta superior
              let transform = `scale(${scale}) translateY(${yOffset}px)`;
              let transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
              
              if (isTopCard) {
                if (isDragging) {
                  const rotation = offset.x / 30;
                  const rotateY = offset.x / 100;
                  transform = `translateX(${offset.x}px) translateY(${offset.y * 0.2}px) rotate(${rotation}deg) rotateY(${rotateY}deg)`;
                  transition = 'none';
                } else if (isAnimating) {
                  const direction = offset.x > 0 ? 1 : -1;
                  transform = `translateX(${offset.x}px) translateY(${offset.y * 0.2}px) rotate(${direction * 25}deg) scale(0.9)`;
                  transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                }
              }

              return (
                <div
                  key={tip.title}
                  className={`tip-card ${isTopCard ? 'active' : ''}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: zIndex,
                    transform: transform,
                    opacity: opacity,
                    transition: transition,
                    cursor: isTopCard ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    pointerEvents: isTopCard ? 'auto' : 'none',
                    transformStyle: 'preserve-3d'
                  }}
                  onMouseDown={isTopCard ? handleMouseDown : undefined}
                  onTouchStart={isTopCard ? handleTouchStart : undefined}
                  onTouchMove={isTopCard ? handleTouchMove : undefined}
                  onTouchEnd={isTopCard ? handleTouchEnd : undefined}
                >
                  <div className="tip-card-content">
                    <div style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: '16px' }}>
                      {tip.emoji}
                    </div>
                    <h3 style={{ 
                      textAlign: 'center', 
                      color: 'var(--text-primary)', 
                      marginBottom: '20px',
                      fontSize: '1.4rem'
                    }}>
                      {tip.title}
                    </h3>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0,
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: '1.8'
                    }}>
                      {tip.content.map((item, idx) => (
                        <li key={idx} style={{ 
                          marginBottom: '10px', 
                          paddingLeft: '24px', 
                          position: 'relative' 
                        }}>
                          <span style={{ 
                            position: 'absolute', 
                            left: 0,
                            color: 'var(--accent-gold)'
                          }}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                    {tip.hasButton && (
                      <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <a 
                          href={tip.buttonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ 
                            textDecoration: 'none',
                            display: 'inline-flex',
                            gap: '8px',
                            fontSize: '0.95rem',
                            pointerEvents: 'auto'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tip.buttonText}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Counter & Indicators */}
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Indicadores de puntos */}
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            justifyContent: 'center'
          }}>
            {TIPS.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: currentCardIndex === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentCardIndex === idx 
                    ? 'var(--accent-gold)' 
                    : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  boxShadow: currentCardIndex === idx 
                    ? '0 0 8px rgba(255,215,0,0.6)' 
                    : 'none'
                }}
              />
            ))}
          </div>
          
          {/* Contador de carta */}
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            Carta {currentCardIndex + 1} de {TIPS.length}
          </div>
        </div>
      </div>

      {/* Tests Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'tests' })}
          style={{ fontSize: '0.85rem', opacity: 0.7 }}
        >
          🧪 Tests (Modo desarrollador)
        </button>
      </div>
    </div>
  );
}
