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

  const reset = () => dispatch({ type: 'RESET_GAME', initialState: initialState });
  const showScoreboard = ['turn', 'skullIsland', 'finished'].includes(state.screen);

  return (
    <div className="appFrame">
      <div className="container">
        <header className="card topbar">
          <div className="topbarRow">
            <div>
              <h1 className="brandTitle">Isla Calavera</h1>
              <div className="subtitle">Contador de puntuación con cartas y dados (2–5 jugadores)</div>
            </div>

            <div className="headerActions">
              <button
                className="btn btn-ghost"
                onClick={() => dispatch({ type: 'NAVIGATE', screen: 'tests' })}
              >
                Tests
              </button>

              <button className="btn btn-primary" onClick={reset}>
                Nueva partida
              </button>
            </div>
          </div>
        </header>

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
