import { FORTUNE } from '../engine/constants.js';

export function Setup({ state, dispatch }){
  return (
    <div className="grid">
      <div className="card">
        <h2>⚙️ Configuración</h2>
        <label>Modo de juego</label>
        <select value={state.mode} onChange={(e) => dispatch({ type: 'SET_MODE', mode: e.target.value })}>
          <option value="normal">Normal (no baja de 0)</option>
          <option value="hardcore">Hardcore (permite negativo)</option>
        </select>

        <label>Número de jugadores</label>
        <div className="row" style={{ marginTop: 8 }}>
          {[2,3,4,5].map(n => (
            <button
              key={n}
              className="btn btn-primary"
              onClick={() => dispatch({ type: 'SET_NUM_PLAYERS', numPlayers: n })}
              style={{
                filter: state.numPlayers === n ? 'brightness(1.08)' : 'brightness(.92)'
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="divider" />
        <div className="right">
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'GO_NAMES' })}>
            Continuar
          </button>
        </div>
      </div>

      <div className="card">
        <h2>📌 Nota</h2>
        <div className="small muted">
          Primera tirada con 8 dados; Isla Calavera con 4+ calaveras.
        </div>
      </div>
    </div>
  );
}
