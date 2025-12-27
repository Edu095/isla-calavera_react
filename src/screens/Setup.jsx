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
    emoji: '🃏',
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
  }
];

export function Setup({ state, dispatch }){
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Config Card */}
      <div className="card fade-in">
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
                fontWeight: 'bold'
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

      {/* Tips Carousel */}
      <div className="card card-dark fade-in" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>📚 Guía Rápida</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="mini" onClick={prevTip} style={{ background: 'rgba(255,255,255,0.1)' }}>←</button>
            <button className="mini" onClick={nextTip} style={{ background: 'rgba(255,255,255,0.1)' }}>→</button>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(91,180,217,0.2) 0%, rgba(165,216,232,0.1) 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          minHeight: '200px',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '12px' }}>
            {TIPS[currentTip].emoji}
          </div>
          <h3 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '16px' }}>
            {TIPS[currentTip].title}
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            lineHeight: '1.8'
          }}>
            {TIPS[currentTip].content.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px', paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Dots Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {TIPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTip(idx)}
              style={{
                width: currentTip === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentTip === idx ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Tip ${idx + 1}`}
            />
          ))}
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
