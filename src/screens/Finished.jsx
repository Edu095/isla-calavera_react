const PIRATE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A8E6CF',
  '#C77DFF'
];

const MEDALS = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'];

export function Finished({ state, dispatch }){
  const winner = state.players.find(p => p.id === state.winnerId);
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winnerIndex = state.players.findIndex(p => p.id === state.winnerId);
  const winnerColor = PIRATE_COLORS[winnerIndex % PIRATE_COLORS.length];

  return (
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

        <div style={{ fontSize: '4rem', marginBottom: '16px', position: 'relative' }}>
          \ud83c\udf89
        </div>
        <h2 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 8px 0', 
          color: 'var(--text-primary)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          \u00a1PARTIDA TERMINADA!
        </h2>
        <div style={{ 
          fontSize: '1.1rem', 
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
        <div style={{ textAlign: 'center', padding: '24px' }}>
          {/* Crown */}
          <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
            \ud83d\udc51
          </div>

          {/* Winner Badge */}
          <div style={{
            display: 'inline-block',
            padding: '8px 24px',
            background: winnerColor,
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '16px',
            boxShadow: `0 4px 12px ${winnerColor}60`
          }}>
            \ud83c\udfc6 GANADOR
          </div>

          {/* Winner Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: winnerColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            margin: '0 auto 24px',
            boxShadow: `0 8px 24px ${winnerColor}60`,
            border: '4px solid white'
          }}>
            \ud83c\udff4\u200d\u2620\ufe0f
          </div>

          {/* Winner Name */}
          <h2 style={{
            fontSize: '2.5rem',
            margin: '0 0 12px 0',
            color: 'var(--text-dark)',
            fontFamily: '\'Pirata One\', cursive'
          }}>
            {winner?.name}
          </h2>

          {/* Winner Score */}
          <div style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: winnerColor,
            textShadow: `0 0 20px ${winnerColor}80`,
            marginBottom: '16px'
          }}>
            {winner?.score?.toLocaleString('es-ES')}
          </div>

          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            puntos finales
          </div>
        </div>
      </div>

      {/* Final Ranking */}
      <div className="card card-dark slide-in" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>
          \ud83c\udfc6 Clasificaci\u00f3n Final
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  padding: '20px',
                  background: isWinner
                    ? `linear-gradient(90deg, ${playerColor}40 0%, ${playerColor}20 100%)`
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: 'var(--radius-lg)',
                  border: isWinner ? `2px solid ${playerColor}` : '2px solid transparent',
                  transform: isWinner ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Position */}
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    minWidth: '50px',
                    textAlign: 'center',
                    color: 'var(--text-primary)'
                  }}>
                    {medal || `#${idx + 1}`}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: playerColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: isWinner ? `0 4px 12px ${playerColor}60` : '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    \ud83c\udff4\u200d\u2620\ufe0f
                  </div>

                  {/* Name */}
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '1.3rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {p.name}
                      {isWinner && <span style={{ fontSize: '1.2rem' }}>\ud83d\udc51</span>}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}>
                      Posici\u00f3n: {idx + 1}\u00ba
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: isWinner ? playerColor : 'var(--text-primary)'
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
            style={{ fontSize: '1.2rem', padding: '16px 32px' }}
          >
            \ud83d\udd04 Nueva Partida
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'setup' })}
            style={{ fontSize: '1rem' }}
          >
            \u2699\ufe0f Volver al Men\u00fa
          </button>
        </div>

        <div className="divider" />
        
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          \ud83c\udf89 \u00a1Gracias por jugar a Isla Calavera! \ud83c\udff4\u200d\u2620\ufe0f
        </div>
      </div>
    </div>
  );
}
