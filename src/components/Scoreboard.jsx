export function Scoreboard({ state }){
    const active = state.players[state.currentPlayerIndex];
    const sorted = [...state.players].sort((a,b) => b.score - a.score);
  
    return (
      <div className="card">
        <h2>📊 Marcador</h2>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="pill">Ronda <b>{state.round}</b></div>
          <div className="pill">Turno de <b>{active?.name}</b></div>
          <div className="pill">
            <small>Modo</small> {state.mode === 'hardcore' ? 'Hardcore' : 'Normal'}
          </div>
        </div>
        <div className="divider" />
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          {sorted.map(p => (
            <div key={p.id} className="card" style={{ background: 'rgba(0,0,0,.22)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div style={{ fontWeight: 900, color: 'var(--gold)' }}>{p.name}</div>
                <div className="score">{p.score.toLocaleString('es-ES')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  