import { useState } from 'react';
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
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const handleTouchStart = (e) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const deltaX = currentX - startX;
    const threshold = 80;

    if (Math.abs(deltaX) > threshold) {
      setTimeout(() => {
        setCards(prev => {
          const newCards = [...prev];
          const topCard = newCards.shift();
          newCards.push(topCard);
          return newCards;
        });
      }, 300);
    }

    setIsSwiping(false);
    setStartX(0);
    setCurrentX(0);
  };

  const handleMouseDown = (e) => {
    setIsSwiping(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    
    const deltaX = currentX - startX;
    const threshold = 80;

    if (Math.abs(deltaX) > threshold) {
      setTimeout(() => {
        setCards(prev => {
          const newCards = [...prev];
          const topCard = newCards.shift();
          newCards.push(topCard);
          return newCards;
        });
      }, 300);
    }

    setIsSwiping(false);
    setStartX(0);
    setCurrentX(0);
  };

  const swipeX = isSwiping ? currentX - startX : 0;
  const swipeRotate = isSwiping ? (swipeX / 20) : 0;

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
          className="card-stack-container"
          style={{
            position: 'relative',
            width: '100%',
            height: '450px',
            perspective: '700px',
            userSelect: 'none'
          }}
        >
          <div className="card-stack">
            {cards.map((tip, index) => (
              <div
                key={`${tip.title}-${index}`}
                className="tip-card"
                style={{
                  '--i': index,
                  '--swipe-x': index === 0 ? `${swipeX}px` : '0px',
                  '--swipe-rotate': index === 0 ? `${swipeRotate}deg` : '0deg',
                }}
                onMouseDown={index === 0 ? handleMouseDown : undefined}
                onMouseMove={index === 0 ? handleMouseMove : undefined}
                onMouseUp={index === 0 ? handleMouseUp : undefined}
                onMouseLeave={index === 0 ? handleMouseUp : undefined}
                onTouchStart={index === 0 ? handleTouchStart : undefined}
                onTouchMove={index === 0 ? handleTouchMove : undefined}
                onTouchEnd={index === 0 ? handleTouchEnd : undefined}
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
                          fontSize: '0.95rem'
                        }}
                      >
                        {tip.buttonText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Counter */}
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          Carta {cards.length > 0 ? '1' : '0'} de {TIPS.length}
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
