import { useState } from 'react';

const PIRATE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A8E6CF',
  '#C77DFF'
];

const GOAL = 6000;

export function Scoreboard({ state }){
  const [isCollapsed, setIsCollapsed] = useState(false);
  const active = state.players[state.currentPlayerIndex];
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  
  const round = state.round ?? state.roundNumber ?? state.turn?.round ?? 1;
  const modeLabel = state.mode === 'hardcore' ? '💀 Hardcore' : '😊 Fácil';
  const isSuddenDeath = round >= 14;

  return (
    <div className="wooden-box wooden-box-dark fade-in" style={{ marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isCollapsed ? 0 : '16px'
      }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>📋 Marcador</h2>
        <button
          className="btn btn-ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
        >
          {isCollapsed ? '▼ Expandir' : '▲ Colapsar'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Sudden Death Warning */}
          {isSuddenDeath && (
            <div className="notice warning" style={{ 
              marginBottom: '16px',
              background: 'linear-gradient(135deg, rgba(217,120,53,0.2) 0%, rgba(217,120,53,0.1) 100%)',
              border: '2px solid var(--warning-orange)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '2rem' }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    ¡MUERTE SÚBITA!
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Ronda {round}: El primero en alcanzar 6000 puntos gana instantáneamente.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Pills */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            marginBottom: '16px'
          }}>
            <span className="pill" style={{ 
              background: isSuddenDeath ? 'var(--danger-red)' : 'var(--warning-orange)',
              animation: isSuddenDeath ? 'pulse 2s ease-in-out infinite' : 'none'
            }}>
              {isSuddenDeath ? '⚡ ' : ''}Ronda {round}
            </span>
            <span className="pill" style={{ background: 'var(--accent-blue)' }}>
              Turno: {active?.name ?? '—'}
            </span>
            <span className="pill" style={{ background: 'var(--card-dark)' }}>
              {modeLabel}
            </span>
          </div>

          <div className="divider" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {/* Players List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sorted.map((p, idx) => {
              const isActive = p.id === active?.id;
              const progress = Math.min((p.score / GOAL) * 100, 100);
              const playerColor = PIRATE_COLORS[state.players.findIndex(pl => pl.id === p.id) % PIRATE_COLORS.length];

              return (
                <div
                  key={p.id}
                  style={{
                    background: isActive 
                      ? 'linear-gradient(90deg, rgba(91,180,217,0.3) 0%, rgba(91,180,217,0.1) 100%)'
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    border: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Player Info Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: playerColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        🏴‍☠️
                      </div>
                      
                      {/* Name */}
                      <div>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {p.name}
                          {isActive && <span style={{ fontSize: '1.2rem' }}>⭐</span>}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}>
                          {progress.toFixed(1)}% → {GOAL.toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}>
                      {Math.trunc(p.score).toLocaleString('es-ES')}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${playerColor} 0%, ${playerColor}aa 100%)`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                      boxShadow: `0 0 8px ${playerColor}88`
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
