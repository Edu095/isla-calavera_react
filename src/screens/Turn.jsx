import { DICE_TYPES, FORTUNE, CHEST_ALLOWED } from '../engine/constants.js';

export function Turn({ state, dispatch }){
  const c = state.turn.computed;
  const confirmEnabled = c?.canConfirm;
  const canSelectDice = state.turn.fortune !== 'none';

  const resetTurn = () => {
    if (window.confirm('¿Reiniciar el turno actual? Se borrarán los dados y la carta seleccionados.')) {
      dispatch({ type: 'RESET_TURN' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Card Selection */}
      <div className="card fade-in">
        <h2>🃏 Carta de Acción</h2>
        
        <select 
          value={state.turn.fortune} 
          onChange={(e) => dispatch({ type: 'TURN_SET_FORTUNE', fortune: e.target.value })}
          style={{ fontSize: '1rem', fontWeight: 600 }}
        >
          {FORTUNE.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>

        {/* Visual Card Display */}
        <div style={{
          marginTop: '16px',
          padding: '20px',
          background: state.turn.fortune === 'none' 
            ? 'linear-gradient(135deg, rgba(150,150,150,0.2) 0%, rgba(100,100,100,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(91,180,217,0.2) 0%, rgba(165,216,232,0.1) 100%)',
          borderRadius: 'var(--radius-md)',
          border: state.turn.fortune === 'none' ? '2px solid rgba(150,150,150,0.5)' : '2px solid var(--accent-blue)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
            {state.turn.fortune === 'none' ? '⚠️' : '🎴'}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>
            {FORTUNE.find(f => f.key === state.turn.fortune)?.label || 'Sin carta'}
          </div>
        </div>

        {state.turn.fortune === 'none' && (
          <div className="notice warning" style={{ marginTop: '16px' }}>
            <b>⚠️ Selecciona una carta de acción</b>
            <div className="small" style={{ marginTop: '4px' }}>
              Debes elegir una carta antes de seleccionar los dados.
            </div>
          </div>
        )}
      </div>

      {/* Dice Selection */}
      <div className="card slide-in" style={{ 
        animationDelay: '0.1s',
        opacity: canSelectDice ? 1 : 0.5,
        pointerEvents: canSelectDice ? 'auto' : 'none'
      }}>
        <h2>🎲 Selecciona los Dados (máx. 8)</h2>
        <div className="small muted" style={{ marginBottom: '16px' }}>
          Ajusta la cantidad de cada tipo de dado que has obtenido en tu tirada.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {DICE_TYPES.map(t => {
            const val = state.turn.dice[t.key] || 0;
            const isSkull = t.key === 'skull';
            const borderColor = isSkull ? 'var(--danger-red)' : 'rgba(255,255,255,0.1)';

            return (
              <div 
                key={t.key} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: val > 0 
                    ? 'linear-gradient(90deg, rgba(91,180,217,0.2) 0%, rgba(91,180,217,0.05) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${borderColor}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    fontSize: '2rem',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {t.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {isSkull ? '¡Cuidado! No puntúa' : '100 pts cada uno'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    className="mini" 
                    onClick={() => dispatch({ type: 'TURN_ADJUST_DIE', key: t.key, delta: -1 })}
                    style={{ background: val === 0 ? 'rgba(255,255,255,0.1)' : 'var(--accent-blue)' }}
                    disabled={!canSelectDice}
                  >
                    −
                  </button>
                  <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    minWidth: '48px',
                    textAlign: 'center',
                    color: 'var(--text-dark)'
                  }}>
                    {val}
                  </div>
                  <button 
                    className="mini" 
                    onClick={() => dispatch({ type: 'TURN_ADJUST_DIE', key: t.key, delta: +1 })}
                    disabled={!canSelectDice}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chest UI (only for Botín card) - MOVED HERE */}
      {state.turn.fortune === 'chest' && <ChestUI state={state} dispatch={dispatch} />}

      {/* Score Summary */}
      <div className={`card slide-in ${c?.bust ? 'card-transparent' : ''}`} 
           style={{ 
             animationDelay: '0.2s',
             background: c?.bust 
               ? 'linear-gradient(135deg, rgba(231,76,60,0.3) 0%, rgba(231,76,60,0.1) 100%)'
               : 'linear-gradient(135deg, rgba(39,174,96,0.3) 0%, rgba(39,174,96,0.1) 100%)',
             border: `2px solid ${c?.bust ? 'var(--danger-red)' : 'var(--success-green)'}`
           }}>
        <h2 style={{ color: 'var(--text-primary)' }}>
          {c?.bust ? '☠️ MUERTE' : '💰 Puntos del Turno'}
        </h2>

        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Total de puntos
          </div>
          <div style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: c?.bust ? 'var(--danger-red)' : 'var(--success-green)'
          }}>
            {c?.bust ? '0' : `+${Math.trunc(c?.points || 0).toLocaleString('es-ES')}`}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="kv" style={{ color: 'var(--text-primary)' }}>
            <span>Dados seleccionados</span>
            <b>{c?.totalDice || 0}/8</b>
          </div>
          <div className="kv" style={{ color: 'var(--text-primary)' }}>
            <span>Calaveras totales</span>
            <b style={{ color: (c?.skullsTotal || 0) >= 3 ? 'var(--danger-red)' : 'inherit' }}>
              {c?.skullsTotal || 0}
            </b>
          </div>
        </div>

        {c?.canSkullIsland && (
          <div className="notice warning" style={{ marginTop: '16px' }}>
            <b>💀 ISLA CALAVERA disponible</b>
            <div className="small" style={{ marginTop: '4px' }}>
              Has sacado 4+ calaveras. Puedes activar el modo especial.
            </div>
          </div>
        )}

        {c?.earlyDeath && (
          <div className="notice bad" style={{ marginTop: '16px' }}>
            <b>☠️ Muerte anticipada</b>
            <div className="small" style={{ marginTop: '4px' }}>
              Con 3 calaveras puedes confirmar sin completar 8 dados.
            </div>
          </div>
        )}

        {c?.notes?.length > 0 && (
          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {c.notes.map((n, i) => (
              <div key={i} style={{ marginTop: '4px' }}>• {n}</div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="right" style={{ marginTop: '20px' }}>
          <button 
            className="btn btn-ghost" 
            onClick={resetTurn}
          >
            🔄 Reiniciar Turno
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => dispatch({ type: 'CONFIRM_TURN' })}
            disabled={!confirmEnabled}
            style={{ 
              filter: confirmEnabled ? 'none' : 'grayscale(1) opacity(0.5)',
              fontSize: '1.1rem'
            }}
          >
            ✅ Confirmar Turno
          </button>
        </div>
      </div>
    </div>
  );
}

function ChestUI({ state, dispatch }){
  const dice = state.turn.dice;
  const chest = state.turn.chest;
  const totalChest = CHEST_ALLOWED.reduce((a,k) => a + (chest[k] || 0), 0);

  return (
    <div className="card card-dark slide-in" style={{ animationDelay: '0.15s' }}>
      <h2 style={{ color: 'var(--text-primary)' }}>📦 Cofre del Botín</h2>
      <div className="small" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
        Marca qué dados estaban <b>guardados antes</b> de sacar la 3ª calavera. 
        Si mueres, sólo estos dados puntúan.
      </div>

      <div className="notice warning" style={{ marginBottom: '16px' }}>
        <div className="kv">
          <span>Dados en el Botín</span>
          <b>{totalChest}/8</b>
        </div>
        <div className="small" style={{ marginTop: '8px' }}>
          ⚠️ No se pueden guardar calaveras en el Botín.
        </div>
      </div>

      <div className="right" style={{ marginBottom: '16px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => dispatch({ type: 'CHEST_CLEAR' })}
        >
          🗑️ Vaciar Botín
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => dispatch({ type: 'CHEST_AUTO' })}
        >
          🤖 Auto-guardar (ayuda)
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CHEST_ALLOWED.map(k => {
          const t = DICE_TYPES.find(x => x.key === k);
          const max = dice[k] || 0;
          const val = chest[k] || 0;

          return (
            <div 
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: val > 0 
                  ? 'rgba(243,156,18,0.2)'
                  : 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)',
                opacity: max === 0 ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.5rem' }}>{t.emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Disponibles: {max} | En Botín: <b>{val}</b>
                  </div>
                </div>
              </div>

              <input 
                type="number" 
                min="0"
                max={max}
                value={val}
                onChange={(e) => {
                  const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), max);
                  dispatch({ type: 'CHEST_SET_COUNT', key: k, value: value });
                }}
                disabled={max === 0}
                style={{ 
                  width: '80px', 
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
