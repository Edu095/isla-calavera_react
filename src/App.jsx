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
      if (window.confirm('\u00bfSeguro que quieres empezar una nueva partida? Se perder\u00e1 el progreso actual.')) {
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
                <h1 className="brandTitle">\ud83c\udff4\u200d\u2620\ufe0f Isla Calavera \ud83d\udc80</h1>
                <div className="subtitle">Contador digital de puntuaci\u00f3n para 2\u20135 piratas</div>
              </div>

              <div className="headerActions">
                {state.screen !== 'setup' && state.screen !== 'tests' && (
                  <button
                    className="btn btn-danger"
                    onClick={reset}
                    title="Empezar una nueva partida desde cero"
                  >
                    \ud83d\udd04 Nueva Partida
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
