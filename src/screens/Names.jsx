export function Names({ state, dispatch }){
    return (
      <div className="card">
        <h2>👥 Jugadores</h2>
        <div className="small muted">
          Edita los nombres y confirma para empezar. El jugador inicial será aleatorio.
        </div>
        <div className="divider" />
        <div className="grid">
          {state.players.map((p, i) => (
            <div key={p.id} className="card" style={{ background: 'rgba(0,0,0,.22)' }}>
              <div className="pill">
                <span>🏴‍☠️</span><span>{i+1}</span><small>Jugador</small>
              </div>
              <label>Nombre</label>
              <input 
                type="text" 
                value={p.name}
                onChange={(e) => dispatch({ type: 'SET_PLAYER_NAME', index: i, name: e.target.value })}
              />
              <div className="small muted" style={{ marginTop: 8 }}>
                Puntuación inicial: 0
              </div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="right">
          <button className="btn btn-ghost" onClick={() => dispatch({type:'NAVIGATE', screen:'setup'})}>
            Volver
          </button>
          <button className="btn btn-secondary" onClick={() => dispatch({type:'START_GAME'})}>
            Empezar partida
          </button>
        </div>
      </div>
    );
  }
  