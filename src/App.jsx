import { useMemo, useReducer, useEffect } from 'react';
import { createInitialState } from './state/initialState.js';
import { gameReducer } from './state/gameReducer.js';

import { Setup } from './screens/Setup.jsx';
import { Names } from './screens/Names.jsx';
import { Turn } from './screens/Turn.jsx';
import { SkullIsland } from './screens/SkullIsland.jsx';
import { Finished } from './screens/Finished.jsx';
import { Scoreboard } from './components/Scoreboard.jsx';
import { Tests } from './screens/Tests.jsx';

export default function App(){
  const initialState = useMemo(() => createInitialState(), []);
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-scroll to top when screen changes OR when turn changes (new player or reset)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.screen, state.currentPlayerIndex, state.round]);

  const reset = () => {
    if (state.screen !== 'setup' && state.screen !== 'tests') {
      if (window.confirm('¿Seguro que quieres empezar una nueva partida? Se perderá el progreso actual.')) {
        dispatch({ type: 'RESET_GAME', initialState: initialState });
      }
    } else {
      dispatch({ type: 'RESET_GAME', initialState: initialState });
    }
  };
  
  const showScoreboard = ['turn', 'skullIsland'].includes(state.screen);
  const showHeader = state.screen !== 'finished';

  // Finished screen renders its own container
  if (state.screen === 'finished') {
    return (
      <div className="appFrame">
        <Finished state={state} dispatch={dispatch} />
      </div>
    );
  }

  return (
    <div className="appFrame">
      <div className="container">
        {showHeader && (
          <header className="pirate-flag-header">
            <div className="flag-pole"></div>
            <div className="pirate-flag">
              <div className="flag-content">
                <div className="skull-icon">☠️</div>
                <h1 className="flag-title">Isla Calavera</h1>
              </div>
              {state.screen !== 'setup' && state.screen !== 'tests' && state.screen !== 'names' && (
                <button
                  className="btn btn-danger flag-reset-btn"
                  onClick={reset}
                  title="Empezar una nueva partida desde cero"
                >
                  🔄 Nueva Partida
                </button>
              )}
            </div>
          </header>
        )}

        <div style={{ height: 24 }} />

        {state.screen === 'setup' && <Setup state={state} dispatch={dispatch} />}
        {state.screen === 'names' && <Names state={state} dispatch={dispatch} />}
        {showScoreboard && <Scoreboard state={state} />}
        {state.screen === 'turn' && <Turn state={state} dispatch={dispatch} />}
        {state.screen === 'skullIsland' && <SkullIsland state={state} dispatch={dispatch} />}
        {state.screen === 'tests' && <Tests onBack={() => dispatch({ type: 'NAVIGATE', screen: 'setup' })} />}
      </div>
    </div>
  );
}
