const PIRATE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A8E6CF',
  '#C77DFF'
];

const MEDALS = ['🥇', '🥈', '🥉'];

export function Finished({ state, dispatch }){
  const winner = state.players.find(p => p.id === state.winnerId);
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winnerIndex = state.players.findIndex(p => p.id === state.winnerId);
  const winnerColor = PIRATE_COLORS[winnerIndex % PIRATE_COLORS.length];

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Celebration Header */}
        <div className="card card-dark fade-in" style={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${winnerColor}40 0%, ${winnerColor}20 100%)`,
          border: `3px solid ${winnerColor}`,
          boxShadow: `0 0 40px ${winnerColor}60`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Confetti Effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ fontSize: '3rem', marginBottom: '12px', position: 'relative' }}>
            🎉
          </div>
          <h2 style={{ 
            fontSize: '2rem', 
            margin: '0 0 8px 0', 
            color: 'var(--text-primary)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            ¡PARTIDA TERMINADA!
          </h2>
          <div style={{ 
            fontSize: '1rem', 
            color: 'var(--text-primary)', 
            opacity: 0.9
          }}>
            Un pirata ha alcanzado los 6000 puntos
          </div>
        </div>

        {/* Winner Podium */}
        <div className="card slide-in" style={{ 
          animationDelay: '0.1s',
          background: `linear-gradient(135deg, ${winnerColor}30 0%, ${winnerColor}10 100%)`,
          border: `2px solid ${winnerColor}`
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {/* Crown */}
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
              👑
            </div>

            {/* Winner Badge */}
            <div style={{
              display: 'inline-block',
              padding: '6px 20px',
              background: winnerColor,
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '12px',
              boxShadow: `0 4px 12px ${winnerColor}60`
            }}>
              🏆 GANADOR
            </div>

            {/* Winner Avatar */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: winnerColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              margin: '0 auto 16px',
              boxShadow: `0 8px 24px ${winnerColor}60`,
              border: '4px solid white'
            }}>
              🏴‍☠️
            </div>

            {/* Winner Name */}
            <h2 style={{
              fontSize: '2rem',
              margin: '0 0 8px 0',
              color: 'var(--text-dark)',
              fontFamily: '\'Pirata One\', cursive'
            }}>
              {winner?.name}
            </h2>

            {/* Winner Score */}
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: winnerColor,
              textShadow: `0 0 20px ${winnerColor}80`,
              marginBottom: '8px'
            }}>
              {winner?.score?.toLocaleString('es-ES')}
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              puntos finales
            </div>
          </div>
        </div>

        {/* Final Ranking */}
        <div className="card card-dark slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
            🏆 Clasificación Final
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sorted.map((p, idx) => {
              const playerIndex = state.players.findIndex(pl => pl.id === p.id);
              const playerColor = PIRATE_COLORS[playerIndex % PIRATE_COLORS.length];
              const isWinner = p.id === winner?.id;
              const medal = MEDALS[idx] || '';

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: isWinner
                      ? `linear-gradient(90deg, ${playerColor}40 0%, ${playerColor}20 100%)`
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-lg)',
                    border: isWinner ? `2px solid ${playerColor}` : '2px solid transparent',
                    transform: isWinner ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Position */}
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      minWidth: '40px',
                      textAlign: 'center',
                      color: 'var(--text-primary)'
                    }}>
                      {medal || `#${idx + 1}`}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: playerColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                      boxShadow: isWinner ? `0 4px 12px ${playerColor}60` : '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      🏴‍☠️
                    </div>

                    {/* Name */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                        {isWinner && <span style={{ fontSize: '1rem', flexShrink: 0 }}>👑</span>}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        Posición: {idx + 1}º
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: isWinner ? playerColor : 'var(--text-primary)',
                    marginLeft: '8px',
                    flexShrink: 0
                  }}>
                    {Math.trunc(p.score).toLocaleString('es-ES')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => dispatch({ type: 'RESET_GAME', initialState: state })}
              style={{ fontSize: '1.1rem', padding: '14px 28px' }}
            >
              🔄 Nueva Partida
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'setup' })}
              style={{ fontSize: '0.95rem' }}
            >
              ⚙️ Volver al Menú
            </button>
          </div>

          <div className="divider" />
          
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🎉 ¡Gracias por jugar a Isla Calavera! 🏴‍☠️
          </div>
        </div>
      </div>
    </div>
  );
}
