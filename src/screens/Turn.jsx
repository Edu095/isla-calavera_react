import { DICE_TYPES, FORTUNE, CHEST_ALLOWED } from '../engine/constants.js';

export function Turn({ state, dispatch }){
  const c = state.turn.computed;
  const confirmEnabled = c?.canConfirm;
  const confirmStyle = confirmEnabled ? 'none' : 'grayscale(1) opacity(.65)';

  return (
    <div className="grid">
      <div className="card">
        <h2>🎲 Turno</h2>

        <label>Carta de acción</label>
        <select 
          value={state.turn.fortune} 
          onChange={(e) => dispatch({ type: 'TURN_SET_FORTUNE', fortune: e.target.value })}
        >
          {FORTUNE.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>

        <div className="divider" />

        <div className={`notice ${c?.bust ? 'bad' : 'good'}`}>
          <div className="kv">
            <span>Dados seleccionados</span>
            <b>{c?.totalDice || 0}/8</b>
          </div>
          <div className="kv">
            <span>Calaveras totales</span>
            <b>{c?.skullsTotal || 0}</b>
          </div>
          <div className="kv">
            <span>Puntos del turno</span>
            <b>{Math.trunc(c?.points || 0).toLocaleString('es-ES')}</b>
          </div>
          {c?.canSkullIsland && (
            <div className="small" style={{ marginTop: 6 }}>
              <b>Isla Calavera</b> disponible (4+ calaveras).
            </div>
          )}
          {c?.earlyDeath && (
            <div className="small" style={{ marginTop: 6 }}>
              <b>Muerte</b>: puedes confirmar ya (esta carta no requiere 8 dados).
            </div>
          )}
          {state.turn.fortune === 'chest' && (state.turn.dice.skull || 0) >= 3 && !c?.canSkullIsland && (
            <div className="small" style={{ marginTop: 6 }}>
              <b>Muerte</b>: con Botín debes completar 8 dados (salvo Isla Calavera).
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }} className="right">
          <button 
            className="btn btn-ghost" 
            onClick={() => dispatch({ type: 'RESET_GAME', initialState: state })}
          >
            Nueva partida
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => dispatch({ type: 'CONFIRM_TURN' })}
            disabled={!confirmEnabled}
            style={{ filter: confirmStyle }}
          >
            Confirmar
          </button>
        </div>

        <div className="divider" />
        <div className="small muted">
          {c?.notes?.length ? c.notes.map(n => `• ${n}`).join('; ') : 'Selecciona carta y reparte los dados.'}
        </div>
      </div>

      <div className="card">
        <h2>🧮 Dados (hasta 8)</h2>
        <div className="small muted">
          Sin Botín: al sacar 3 calaveras puedes confirmar sin llegar a 8 (muerte inmediata).
        </div>
        <div className="divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {DICE_TYPES.map(t => {
            const val = state.turn.dice[t.key] || 0;
            return (
              <div key={t.key} className="counter">
                <div>
                  <div className="name">{t.emoji} {t.label}</div>
                  <div className="sub">Seleccionados: {val}</div>
                </div>
                <div className="ctl">
                  <button 
                    className="mini" 
                    onClick={() => dispatch({ type: 'TURN_ADJUST_DIE', key: t.key, delta: -1 })}
                  >−</button>
                  <div className="num">{val}</div>
                  <button 
                    className="mini" 
                    onClick={() => dispatch({ type: 'TURN_ADJUST_DIE', key: t.key, delta: +1 })}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {state.turn.fortune === 'chest' && <ChestUI state={state} dispatch={dispatch} />}
    </div>
  );
}

function ChestUI({ state, dispatch }){
  const dice = state.turn.dice;
  const chest = state.turn.chest;
  const totalChest = CHEST_ALLOWED.reduce((a,k) => a + (chest[k] || 0), 0);

  return (
    <div className="card" style={{ background: 'rgba(0,0,0,.22)' }}>
      <h2>📦 Botín</h2>
      <div className="small muted">
        Marca qué dados estaban guardados <b>antes</b> de sacar la 3ª calavera. Si mueres, sólo puntúan esos dados.
      </div>
      <div className="divider" />

      <div className="right">
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'CHEST_AUTO' })}>
          Auto-guardar (ayuda)
        </button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'CHEST_CLEAR' })}>
          Vaciar Botín
        </button>
      </div>

      <div className="divider" />
      <div className="notice">
        <div className="kv">
          <span>Dados en Botín</span>
          <b>{totalChest}/8</b>
        </div>
        <div className="small muted">En Botín no se pueden guardar calaveras.</div>
      </div>

      <div className="divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {CHEST_ALLOWED.map(k => {
          const t = DICE_TYPES.find(x => x.key === k);
          const max = dice[k] || 0;
          const val = chest[k] || 0;

          return (
            <div key={k} className="checkrow">
              <div>
                <div style={{ fontWeight: 900 }}>
                  {t.emoji} {t.label} <span className="tag">(han salido: {max})</span>
                </div>
                <div className="tag">En Botín: <b>{val}</b></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  value={val}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                    dispatch({ type: 'CHEST_SET_COUNT', key: k, value: e.target.value });
                  }}
                  style={{ width: 72, textAlign: 'center' }}
                  disabled={max === 0}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
