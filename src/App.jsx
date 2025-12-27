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

  // Scoreboard solo en pantallas de partida
  const showScoreboard = ['turn', 'skullIsland', 'finished'].includes(state.screen);

  return (
    <div className="container">
      <header className="card">
        <div className="row" style={{ justifyContent:'space-between', gap: 12, alignItems:'center', flexWrap:'wrap' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.15rem', 
              background: 'linear-gradient(45deg, var(--gold), #ffed4e, var(--orange))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 6
            }}>
              🏴‍☠️ Isla Calavera
            </h1>
            <div style={{ color: 'var(--muted)' }}>
              Contador de puntuación con cartas y dados (2–5 jugadores)
            </div>
          </div>
          <div className="row">
            <button className="btn btn-ghost" onClick={() => dispatch({type:'NAVIGATE', screen:'tests'})}>
              🧪 Tests
            </button>
            <button className="btn btn-primary" onClick={reset}>
              🔄 Nueva partida
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
      
      {state.screen === 'tests' && <Tests onBack={() => dispatch({type:'NAVIGATE', screen:'setup'})} />}
    </div>
  );
}
