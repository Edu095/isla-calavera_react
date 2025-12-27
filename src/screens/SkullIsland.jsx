export function SkullIsland({ state, dispatch }){
  const active = state.players[state.currentPlayerIndex];
  const perSkull = state.turn.fortune === 'pirate' ? 200 : 100;
  const totalPenalty = perSkull * (state.skullIsland.collectedSkulls || 0);
  const rivals = state.players.filter(p => p.id !== active?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Dramatic Header */}
      <div className="card card-dark fade-in" style={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(231,76,60,0.4) 0%, rgba(139,0,0,0.6) 100%)',
        border: '3px solid var(--danger-red)',
        boxShadow: '0 0 30px rgba(231,76,60,0.5)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>
          💀
        </div>
        <h2 style={{ 
          fontSize: '2.5rem', 
          margin: 0, 
          color: 'var(--text-primary)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          ISLA CALAVERA
        </h2>
        <div style={{ 
          fontSize: '1.1rem', 
          color: 'var(--text-primary)', 
          marginTop: '8px',
          opacity: 0.9
        }}>
          ¡4+ Calaveras en primera tirada!
        </div>
      </div>

      {/* Info Card */}
      <div className="card slide-in" style={{ animationDelay: '0.1s' }}>
        <h2>⚠️ Información del Modo</h2>
        
        <div className="notice bad">
          <div className="kv">
            <span>Jugador activo</span>
            <b>{active?.name}</b>
          </div>
          <div className="kv">
            <span>Puntuación este turno</span>
            <b style={{ color: 'var(--danger-red)' }}>0 puntos</b>
          </div>
          <div className="divider" style={{ background: 'rgba(231,76,60,0.3)' }} />
          <div className="kv">
            <span>Penalización por calavera</span>
            <b>-{perSkull} pts</b>
          </div>
          <div className="kv">
            <span>Calaveras acumuladas</span>
            <b>{state.skullIsland.collectedSkulls}</b>
          </div>
          {state.turn.fortune === 'pirate' && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              background: 'rgba(231,76,60,0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem'
            }}>
              🏴‍☠️ <b>Carta Pirata activa:</b> Penalización doble (200 pts/calavera)
            </div>
          )}
        </div>
      </div>

      {/* Skull Counter */}
      <div className="card card-dark slide-in" style={{ 
        animationDelay: '0.2s',
        background: 'linear-gradient(135deg, rgba(30,42,58,0.9) 0%, rgba(26,27,38,0.9) 100%)'
      }}>
        <h2 style={{ color: 'var(--text-primary)' }}>💀 Ajustar Calaveras Finales</h2>
        <div className="small" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          Si has conseguido más calaveras tras activar el modo, ajústalo aquí.
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          padding: '32px',
          background: 'rgba(231,76,60,0.1)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--danger-red)'
        }}>
          <button 
            className="mini" 
            onClick={() => dispatch({ type: 'SKULLISLAND_ADJUST', delta: -1 })}
            style={{ 
              width: '60px', 
              height: '60px', 
              fontSize: '2rem',
              background: 'var(--danger-red)'
            }}
          >
            −
          </button>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Total de calaveras
            </div>
            <div style={{
              fontSize: '4rem',
              fontWeight: 700,
              color: 'var(--danger-red)',
              textShadow: '0 0 20px rgba(231,76,60,0.5)',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              {state.skullIsland.collectedSkulls}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              💀 calaveras
            </div>
          </div>

          <button 
            className="mini" 
            onClick={() => dispatch({ type: 'SKULLISLAND_ADJUST', delta: +1 })}
            style={{ 
              width: '60px', 
              height: '60px', 
              fontSize: '2rem',
              background: 'var(--danger-red)'
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Rivals Penalty Preview */}
      <div className="card slide-in" style={{ animationDelay: '0.3s' }}>
        <h2>💥 Impacto en los Rivales</h2>
        <div className="small muted" style={{ marginBottom: '16px' }}>
          Estos jugadores perderán puntos al aplicar la penalización.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rivals.map(p => {
            const newScore = Math.max(0, p.score - totalPenalty);
            const actualLoss = p.score - newScore;

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'linear-gradient(90deg, rgba(231,76,60,0.15) 0%, rgba(231,76,60,0.05) 100%)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(231,76,60,0.3)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                    🏴‍☠️ {p.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {p.score.toLocaleString('es-ES')} → {newScore.toLocaleString('es-ES')} pts
                  </div>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--danger-red)'
                }}>
                  -{actualLoss.toLocaleString('es-ES')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="notice warning" style={{ marginTop: '16px' }}>
          <div className="kv">
            <span>Penalización total por jugador</span>
            <b style={{ color: 'var(--danger-red)' }}>-{totalPenalty.toLocaleString('es-ES')} pts</b>
          </div>
          <div className="small" style={{ marginTop: '8px' }}>
            Cálculo: {state.skullIsland.collectedSkulls} calaveras × {perSkull} pts
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card card-dark fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="right">
          <button 
            className="btn btn-ghost" 
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'turn' })}
          >
            ← Volver al Turno
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => dispatch({ type: 'APPLY_SKULLISLAND' })}
            style={{ fontSize: '1.1rem' }}
          >
            ☠️ Aplicar Penalización
          </button>
        </div>

        <div className="divider" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="small" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          Al aplicar, {active?.name} no puntúa este turno y los demás pierden {perSkull} puntos por cada calavera.
        </div>
      </div>
    </div>
  );
}
