export function SkullIsland({ state, dispatch }){
    const active = state.players[state.currentPlayerIndex];
    const perSkull = state.turn.fortune === 'pirate' ? 200 : 100;
  
    return (
      <div className="grid">
        <div className="card">
          <h2>💀 Isla Calavera</h2>
          <div className="notice bad">
            <div className="kv"><span>Jugador activo</span><b>{active?.name}</b></div>
            <div className="kv"><span>Penalización por calavera</span><b>{perSkull}</b></div>
            <div className="kv"><span>Calaveras acumuladas</span><b>{state.skullIsland.collectedSkulls}</b></div>
          </div>
  
          <div className="divider" />
  
          <div className="counter">
            <div>
              <div className="name">💀 Calaveras</div>
              <div className="sub">Ajusta el total final</div>
            </div>
            <div className="ctl">
              <button className="mini" onClick={() => dispatch({type:'SKULLISLAND_ADJUST', delta:-1})}>−</button>
              <div className="num">{state.skullIsland.collectedSkulls}</div>
              <button className="mini" onClick={() => dispatch({type:'SKULLISLAND_ADJUST', delta:+1})}>+</button>
            </div>
          </div>
  
          <div className="divider" />
          <div className="right">
            <button className="btn btn-ghost" onClick={() => dispatch({type:'NAVIGATE', screen:'turn'})}>
              Volver
            </button>
            <button className="btn btn-secondary" onClick={() => dispatch({type:'APPLY_SKULLISLAND'})}>
              Aplicar penalización
            </button>
          </div>
  
          <div className="divider" />
          <div className="small muted">
            En Isla Calavera el jugador no puntúa y los demás pierden {perSkull} por calavera (con Pirata: 200).
          </div>
        </div>
      </div>
    );
  }
  