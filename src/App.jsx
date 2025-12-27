import { useMemo, useReducer } from 'react';
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

  const reset = () => {
    if (state.screen !== 'setup' && state.screen !== 'tests') {
      if (window.confirm('¿Seguro que quieres empezar una nueva partida? Se perderá el progreso actual.')) {
        dispatch({ type: 'RESET_GAME', initialState: initialState });
      }
    } else {
      dispatch({ type: 'RESET_GAME', initialState: initialState });
    }
  };
  
  const showScoreboard = ['turn', 'skullIsland', 'finished'].includes(state.screen);
  const showHeader = state.screen !== 'finished'; // Hide header on finished screen for cleaner look

  return (
    <div className="appFrame">
      <div className="container">
        {showHeader && (
          <header className="card topbar fade-in">
            <div className="topbarRow">
              <div>
                <h1 className="brandTitle">🏴‍☠️ Isla Calavera 💀</h1>
                <div className="subtitle">Contador digital de puntuación para 2–5 piratas</div>
              </div>

              <div className="headerActions">
                {state.screen !== 'setup' && state.screen !== 'tests' && (
                  <button
                    className="btn btn-danger"
                    onClick={reset}
                    title="Empezar una nueva partida desde cero"
                  >
                    🔄 Nueva Partida
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        <div style={{ height: 12 }} />

        {state.screen === 'setup' && <Setup state={state} dispatch={dispatch} />}
        {state.screen === 'names' && <Names state={state} dispatch={dispatch} />}
        {showScoreboard && <Scoreboard state={state} />}
        {state.screen === 'turn' && <Turn state={state} dispatch={dispatch} />}
        {state.screen === 'skullIsland' && <SkullIsland state={state} dispatch={dispatch} />}
        {state.screen === 'finished' && <Finished state={state} dispatch={dispatch} />}
        {state.screen === 'tests' && <Tests onBack={() => dispatch({ type: 'NAVIGATE', screen: 'setup' })} />}
      </div>
    </div>
  );
}
