export function Finished({ state, dispatch }){
    const winner = state.players.find(p => p.id === state.winnerId);
  
    return (
      <div className="card">
        <h2>🏆 Fin de partida</h2>
        <div className="notice good">
          <div className="kv"><span>Ganador</span><b>{winner?.name}</b></div>
          <div className="kv"><span>Puntuación</span><b>{winner?.score?.toLocaleString('es-ES')}</b></div>
        </div>
        <div className="divider" />
        <div className="right">
          <button className="btn btn-primary" onClick={() => dispatch({type:'RESET_GAME', initialState: state})}>
            Nueva partida
          </button>
        </div>
      </div>
    );
  }
  