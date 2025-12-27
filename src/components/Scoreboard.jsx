export function Scoreboard({ state }){
    const active = state.players[state.currentPlayerIndex];
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
  
    const round = state.round ?? state.roundNumber ?? state.turn?.round ?? 1;
    const modeLabel = state.mode === 'hardcore' ? 'Hardcore' : 'Normal';
  
    return (
      <div className="card scoreboard">
        <h2>Marcador</h2>
  
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <span className="pill">Ronda <b>{round}</b></span>
          <span className="pill">Turno de <b>{active?.name ?? '—'}</b></span>
          <span className="pill">Modo <b>{modeLabel}</b></span>
        </div>
  
        <div className="divider" />
  
        <div className="scoreList">
          {sorted.map((p) => (
            <div
              key={p.id}
              className={`scoreRow ${p.id === active?.id ? 'isActive' : ''}`}
            >
              <div className="scoreName">{p.name}</div>
              <div className="scoreValue">{Math.trunc(p.score).toLocaleString('es-ES')}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  