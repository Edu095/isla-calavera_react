const PIRATE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Cyan
  '#FFE66D', // Yellow
  '#A8E6CF', // Green
  '#C77DFF'  // Purple
];

export function Names({ state, dispatch }){
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Card */}
      <div className="wooden-box wooden-box-dark fade-in">
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>🏴‍☠️ Tripulación</h2>
        <div className="small" style={{ color: 'var(--text-muted)' }}>
          Nombra a los piratas de tu tripulación. El jugador inicial será aleatorio.
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid slide-in" style={{ animationDelay: '0.1s' }}>
        {state.players.map((p, i) => (
          <div 
            key={p.id} 
            className="wooden-box"
            style={{
              background: `linear-gradient(135deg, ${PIRATE_COLORS[i]} 0%, ${PIRATE_COLORS[i]}dd 100%)`,
              animationDelay: `${0.1 + i * 0.1}s`,
              borderColor: `${PIRATE_COLORS[i]}aa ${PIRATE_COLORS[i]}44 ${PIRATE_COLORS[i]}44 ${PIRATE_COLORS[i]}aa`
            }}
          >
            {/* Avatar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              margin: '0 auto 16px',
              fontSize: '2.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              🏴‍☠️
            </div>

            {/* Player Number Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '12px',
              color: 'var(--text-dark)'
            }}>
              <span>#{i + 1}</span>
              <span>•</span>
              <span>Pirata</span>
            </div>

            {/* Name Input */}
            <label style={{ color: 'var(--text-dark)' }}>Nombre del Pirata</label>
            <input 
              type="text" 
              value={p.name}
              onChange={(e) => dispatch({ type: 'SET_PLAYER_NAME', index: i, name: e.target.value })}
              placeholder={`Pirata ${i + 1}`}
              style={{
                background: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                fontSize: '1.1rem',
                textAlign: 'center'
              }}
            />

            {/* Initial Score */}
            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--text-dark)',
              textAlign: 'center'
            }}>
              Puntuación inicial: <b>0</b>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="wooden-box wooden-box-dark fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="right">
          <button 
            className="btn btn-ghost" 
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'setup' })}
          >
            ← Volver
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => dispatch({ type: 'START_GAME' })}
            style={{ fontSize: '1.1rem' }}
          >
            🏴‍☠️ Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
}
