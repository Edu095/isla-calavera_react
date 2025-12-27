import { useMemo, useState } from 'react';

import { createInitialState } from '../state/initialState.js';
import { gameReducer } from '../state/gameReducer.js';

import {
  initDiceCounts,
  computeTurn,
  computePointsFromDice,
  validateChestSelection,
  clampScore,
} from '../engine/rules.js';

import { FORTUNE, CHEST_ALLOWED, TARGET_SCORE } from '../engine/constants.js';

/**
 * Test harness interno (SPA)
 * - Determinísticos: casos concretos documentados
 * - Propiedades: invariantes (property-based style) [web:92]
 * - Fuzzing: aleatorio con semilla reproducible (para “romper” el motor)
 *
 * Nota: Estos tests validan TU motor tal como está implementado ahora.
 * Si cambias reglas (p.ej. bonus cofre completo), actualiza expected.
 */

function mulberry32(seed){
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randInt(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }

function deepClone(x){ return JSON.parse(JSON.stringify(x)); }

function assert(cond, msg, ctx){
  if (!cond){
    const e = new Error(msg);
    e.ctx = ctx;
    throw e;
  }
}

function sumDice(d){
  return Object.values(d).reduce((a,b)=>a+(b||0),0);
}

function normDice(partial){
  const d = initDiceCounts();
  for (const k of Object.keys(d)) d[k] = partial?.[k] || 0;
  return d;
}

function fmt(v){
  return JSON.stringify(v, null, 2);
}

function runReducer(state, actions){
  return actions.reduce((s, a) => gameReducer(s, a), state);
}

/** Helpers para tests numéricos */
function expectTurn({ mode='normal', fortune='none', dice, expected }){
  const d = normDice(dice);
  const res = computeTurn(mode, fortune, d);

  if ('canConfirm' in expected) assert(res.canConfirm === expected.canConfirm, 'canConfirm mismatch', {res, expected, fortune, d, mode});
  if ('canSkullIsland' in expected) assert(res.canSkullIsland === expected.canSkullIsland, 'canSkullIsland mismatch', {res, expected, fortune, d, mode});
  if ('earlyDeath' in expected) assert(res.earlyDeath === expected.earlyDeath, 'earlyDeath mismatch', {res, expected, fortune, d, mode});
  if ('points' in expected) assert(res.points === expected.points, 'points mismatch', {res, expected, fortune, d, mode});
  return res;
}

function expectPoints({ mode='normal', fortune='none', dice, expectedPoints }){
  const d = normDice(dice);
  const res = computePointsFromDice(mode, fortune, d);
  assert(res.points === expectedPoints, 'points mismatch', {res, expectedPoints, fortune, d, mode});
  return res;
}

function computeExpectedFullGold8(){
  // 8 gold -> faceValue 800 + setScore 4000 + fullChestBonus 500 = 5300
  return 5300;
}

function computeExpectedGold3Diamond1NoSkullNoSets(){
  // 3 gold + 1 diamond + (relleno sin sets) -> face 400 + cofre 500 = 900
  return 900;
}

function buildDeterministicTests(){
  const T = [];

  // =========================
  // A) computeTurn / confirm
  // =========================
  T.push({
    id: 'TURN-001',
    title: 'No confirma con <8 (sin muerte/isla)',
    doc: 'Con 4 dados sin calaveras, no hay confirmación.',
    run: () => expectTurn({
      dice: { gold: 3, diamond: 1 },
      expected: { canConfirm: false, points: 0, canSkullIsland: false, earlyDeath: false }
    }),
  });

  T.push({
    id: 'TURN-002',
    title: 'Muerte temprana (3 calaveras)',
    doc: '3 calaveras habilita confirmar aunque no haya 8 (si no es Botín).',
    run: () => expectTurn({
      fortune: 'none',
      dice: { skull: 3 },
      expected: { canConfirm: true, points: 0, canSkullIsland: false, earlyDeath: true }
    }),
  });

  T.push({
    id: 'TURN-003',
    title: 'Isla Calavera (4 calaveras)',
    doc: '4+ calaveras entra en Isla Calavera (canSkullIsland).',
    run: () => expectTurn({
      fortune: 'none',
      dice: { skull: 4 },
      expected: { canConfirm: true, points: 0, canSkullIsland: true, earlyDeath: false }
    }),
  });

  T.push({
    id: 'TURN-004',
    title: 'Isla Calavera tiene prioridad',
    doc: 'Con 4 calaveras NO es muerte temprana, es Isla Calavera.',
    run: () => {
      const r = expectTurn({ fortune:'none', dice:{ skull:4 }, expected:{ canSkullIsland:true }});
      assert(r.earlyDeath === false, 'earlyDeath must be false when skullIsland', {r});
    }
  });

  T.push({
    id: 'TURN-005',
    title: 'Confirmar con 8 dados (sin calaveras)',
    doc: 'Con 8 dados se puede confirmar.',
    run: () => expectTurn({
      fortune:'none',
      dice:{ gold:8 },
      expected:{ canConfirm:true, canSkullIsland:false, earlyDeath:false }
    })
  });

  // =========================
  // B) Puntuación base: sets + face + cofre
  // =========================
  T.push({
    id: 'SCORE-001',
    title: '8 monedas = set + face + cofre',
    doc: 'Esperado: 4000 (set 8) + 800 (face) + 500 (cofre) = 5300.',
    run: () => expectTurn({
      dice:{ gold:8 },
      expected:{ canConfirm:true, points: computeExpectedFullGold8() }
    })
  });

  T.push({
    id: 'SCORE-002',
    title: 'Face value sin cofre (1 calavera)',
    doc: 'Con 1 calavera no hay cofre; pero 3 monedas cuentan como set (+100). Total: 400 + 100 = 500.',
    run: () => expectTurn({
      dice:{ gold:3, diamond:1, skull:1, monkey:1, parrot:2 }, // total 8
      expected:{ canConfirm:true, points: 500 }
    })
  });  

  T.push({
    id: 'SCORE-003',
    title: 'Face value con cofre',
    doc: 'Sin calaveras hay +500 de cofre y 3 monedas suman set +100. Total: 400 + 100 + 500 = 1000.',
    run: () => expectTurn({
      dice:{ gold:3, diamond:1, monkey:2, parrot:2 }, // total 8
      expected:{ canConfirm:true, points: 1000 }
    })
  });  

  T.push({
    id: 'SCORE-004',
    title: 'Set de 3 monos',
    doc: '3 monos da 100. Si además hay cofre completo y no hay skull, +500.',
    run: () => expectTurn({
      dice:{ monkey:3, saber:2, parrot:2, gold:1 }, // total 8
      // face=100, set(monkey3)=100, cofre=500 => 700
      expected:{ canConfirm:true, points: 700 }
    })
  });

  // =========================
  // C) Carta Pirata
  // =========================
  T.push({
    id: 'PIRATE-001',
    title: 'Pirata duplica puntos',
    doc: 'Mismo dado: Pirata debe duplicar el total.',
    run: () => {
      const d = { gold:3, diamond:1, monkey:2, parrot:2 }; // total 8
      const a = expectTurn({ fortune:'none', dice:d, expected:{ canConfirm:true, points: 1000 }});
      const b = expectTurn({ fortune:'pirate', dice:d, expected:{ canConfirm:true, points: 2000 }});
      assert(b.points === a.points * 2, 'pirate must double', {a,b});
    }
  });
  
  // =========================
  // D) Carta Animales (monkey+parrot)
  // =========================
  T.push({
    id: 'ANIMALS-001',
    title: 'Animales combina monos+loros',
    doc: '2 monos + 1 loro con carta animales cuenta como set 3 => 100 (más cofre si aplica).',
    run: () => expectTurn({
      fortune:'animals',
      dice:{ monkey:2, parrot:1, saber:2, gold:1, diamond:2 }, // total 8
      // face=300, animals=3 => 100, cofre=500 => 900
      expected:{ canConfirm:true, points: 900 }
    })
  });

  T.push({
    id: 'ANIMALS-002',
    title: 'Sin animales no hay set',
    doc: '2 monos + 1 loro SIN carta animales no forma set.',
    run: () => expectTurn({
      fortune:'none',
      dice:{ monkey:2, parrot:1, saber:2, gold:1, diamond:2 }, // total 8
      // face=300, sets=0, cofre=500 => 800
      expected:{ canConfirm:true, points: 800 }
    })
  });

  // =========================
  // E) Cartas moneda/diamante (base +1)
  // =========================
  T.push({
    id: 'GOLD-001',
    title: 'Carta Moneda: magia (9 monedas) termina partida',
    doc: 'Con carta Moneda y 8 monedas físicas, el motor totaliza 9 y el flujo debe finalizar la partida.',
    run: () => {
      let s = createInitialState();
      s = runReducer(s, [
        { type:'SET_NUM_PLAYERS', numPlayers: 2 },
        { type:'GO_NAMES' },
        { type:'START_GAME' },
        { type:'TURN_SET_FORTUNE', fortune:'gold' },
      ]);
  
      // meter 8 monedas físicas
      for (let i=0;i<8;i++){
        s = gameReducer(s, { type:'TURN_ADJUST_DIE', key:'gold', delta: +1 });
      }
  
      const current = s.players[s.currentPlayerIndex];
      s = gameReducer(s, { type:'CONFIRM_TURN' });
  
      assert(s.screen === 'finished', 'must finish on magic win (gold)', { s });
      assert(s.winnerId === current.id, 'winner must be current player', { current, s });
    }
  });
  
  // =========================
  // F) Cartas calavera (skull1/2) y “no cofre”
  // =========================
  T.push({
    id: 'SKULLCARD-001',
    title: 'Carta skull1 (efecto cofre)',
    doc: 'Con skull1 se añade 1 calavera base: no hay cofre completo. Con 3 monedas hay set +100.',
    run: () => {
      const d = { gold:3, diamond:1, monkey:2, parrot:2 }; // total 8
      expectTurn({ fortune:'none', dice:d, expected:{ canConfirm:true, points: 1000 }});
      expectTurn({ fortune:'skull1', dice:d, expected:{ canConfirm:true, points: 500 }});
    }
  });
  
  // =========================
  // G) Barcos pirata (ship2/3/4)
  // =========================
  T.push({
    id: 'SHIP-001',
    title: 'Ship2 cumple => +300',
    doc: 'Base incluye set de 3 monedas (+100) y cofre (+500). Total: 400+100+500+300 = 1300.',
    run: () => {
      const d = { saber:2, gold:3, diamond:1, monkey:1, parrot:1 }; // total 8
      expectTurn({ fortune:'ship2', dice:d, expected:{ canConfirm:true, points: 1300 }});
    }
  });
  
  T.push({
    id: 'SHIP-002',
    title: 'Ship2 falla => -300 (clamp normal)',
    doc: 'Si no cumples, puntúas 0 y penalizas; en normal se clampa a 0.',
    run: () => {
      const d = { saber:1, gold:7 }; // total 8
      // ship fail => -300 clamped => 0
      expectTurn({ mode:'normal', fortune:'ship2', dice:d, expected:{ canConfirm:true, points: 0 }});
    }
  });

  T.push({
    id: 'SHIP-003',
    title: 'Ship2 falla => -300 (hardcore)',
    doc: 'En hardcore debe ser negativo.',
    run: () => {
      const d = { saber:1, gold:7 };
      expectTurn({ mode:'hardcore', fortune:'ship2', dice:d, expected:{ canConfirm:true, points: -300 }});
    }
  });

  // =========================
  // H) Botín: validación de selección
  // =========================
  T.push({
    id: 'CHEST-001',
    title: 'Botín no permite calaveras',
    doc: 'validateChestSelection debe rechazar skull en botín.',
    run: () => {
      const final = normDice({ skull:3, gold:5 });
      const chest = normDice({ skull:1 });
      const v = validateChestSelection(final, chest);
      assert(v.ok === false, 'expected invalid chest', {v});
    }
  });

  T.push({
    id: 'CHEST-002',
    title: 'Botín no puede exceder dados finales',
    doc: 'Si marcas más que los dados que han salido, debe fallar.',
    run: () => {
      const final = normDice({ gold:2, diamond:1, skull:5 });
      const chest = normDice({ gold:3 });
      const v = validateChestSelection(final, chest);
      assert(v.ok === false, 'expected invalid chest count', {v});
    }
  });

  T.push({
    id: 'CHEST-003',
    title: 'Botín válido básico',
    doc: 'Selección <= final y sin skull es ok.',
    run: () => {
      const final = normDice({ gold:2, diamond:1, saber:1, monkey:1, parrot:3 }); // total 8
      const chest = normDice({ gold:2, parrot:1 });
      const v = validateChestSelection(final, chest);
      assert(v.ok === true, 'expected valid', {v});
    }
  });

  // =========================
  // I) Reducer: flujo base setup → names → start
  // =========================
  T.push({
    id: 'REDUCER-001',
    title: 'GO_NAMES crea jugadores',
    doc: 'GO_NAMES debe crear N jugadores con score=0 y pasar a screen=names.',
    run: () => {
      let s = createInitialState();
      s = gameReducer(s, { type:'SET_NUM_PLAYERS', numPlayers: 4 });
      s = gameReducer(s, { type:'GO_NAMES' });

      assert(s.screen === 'names', 'must be names', {s});
      assert(s.players.length === 4, 'must have 4 players', {players:s.players});
      assert(s.players.every(p => p.score === 0), 'all scores 0', {players:s.players});
    }
  });

  T.push({
    id: 'REDUCER-002',
    title: 'START_GAME entra en turn',
    doc: 'START_GAME debe pasar a screen=turn con turno inicial.',
    run: () => {
      let s = createInitialState();
      s = gameReducer(s, { type:'SET_NUM_PLAYERS', numPlayers: 2 });
      s = gameReducer(s, { type:'GO_NAMES' });
      s = gameReducer(s, { type:'START_GAME' });
      assert(s.screen === 'turn', 'must be turn', {s});
      assert(s.turn?.fortune === 'none', 'fortune none at turn start', {turn:s.turn});
    }
  });

  // =========================
  // J) Reducer: final phase al llegar a 6000
  // =========================
  T.push({
    id: 'FINAL-001',
    title: 'Al llegar a 6000 se activa finalPhase',
    doc: 'Si un jugador alcanza TARGET_SCORE, finalPhase debe existir.',
    run: () => {
      // Creamos partida con 2 jugadores y forzamos score
      let s = createInitialState();
      s = runReducer(s, [
        { type:'SET_NUM_PLAYERS', numPlayers: 2 },
        { type:'GO_NAMES' },
        { type:'START_GAME' },
      ]);
      // forzamos el score del jugador actual cerca de 6000
      const idx = s.currentPlayerIndex;
      s = deepClone(s);
      s.players[idx].score = TARGET_SCORE - 100;

      // hacemos un turno que da +100 y confirmamos:
      s = gameReducer(s, { type:'TURN_ADJUST_DIE', key:'gold', delta: 8 }); // 8 gold => 5300, pero queremos controlarlo
      // en vez de eso, set a un caso menor no trivial es más complejo; así que aplicamos directo:
      s = deepClone(s);
      s.players[idx].score = TARGET_SCORE; // simula llegada
      // y simulamos la lógica "advanceAfterScoring" llamando CONFIRM_TURN con un turno confirmable de 0 puntos
      // para que ejecute el avance (early death).
      s.turn.dice = normDice({ skull:3 });
      s.turn.computed = computeTurn(s.mode, s.turn.fortune, s.turn.dice);
      s = gameReducer(s, { type:'CONFIRM_TURN' });

      assert(!!s.finalPhase, 'finalPhase must be set', {finalPhase:s.finalPhase});
    }
  });

  return T;
}

/**
 * Propiedades / invariantes del motor.
 * Si una falla, hay un bug lógico grave.
 */
function runPropertyTests(seed, iterations){
  const rng = mulberry32(seed);
  const fortuneKeys = FORTUNE.map(f => f.key);

  for (let i=0; i<iterations; i++){
    const mode = rng() < 0.5 ? 'normal' : 'hardcore';
    const fortune = fortuneKeys[randInt(rng, 0, fortuneKeys.length - 1)];

    // Genera un resultado físico con 0..8 dados
    const d = initDiceCounts();
    let n = randInt(rng, 0, 8);
    const keys = Object.keys(d);
    while (n-- > 0){
      d[keys[randInt(rng, 0, keys.length - 1)]]++;
    }

    const r = computeTurn(mode, fortune, d);

    // P1: total dice <= 8
    assert(sumDice(d) <= 8, 'P1: total dice <= 8', {d});

    // P2: Si canSkullIsland => skullsTotal >= 4 y points = 0
    if (r.canSkullIsland){
      assert(r.skullsTotal >= 4, 'P2: skull island requires >=4 skulls', {fortune, d, r});
      assert(r.points === 0, 'P2: skull island should show 0 points', {fortune, d, r});
      assert(r.canConfirm === true, 'P2: skull island implies confirm', {fortune, d, r});
    }

    // P3: Si earlyDeath => skullsTotal >= 3 y <4, fortune != chest, points=0, canConfirm=true
    if (r.earlyDeath){
      assert(r.skullsTotal >= 3 && r.skullsTotal < 4, 'P3: earlyDeath requires 3 skulls', {fortune, d, r});
      assert(fortune !== 'chest', 'P3: earlyDeath not allowed for chest', {fortune, d, r});
      assert(r.points === 0, 'P3: earlyDeath points must be 0', {fortune, d, r});
      assert(r.canConfirm === true, 'P3: earlyDeath implies confirm', {fortune, d, r});
    }

    // P4: Si no canConfirm, entonces sumDice != 8 y no earlyDeath y no canSkullIslandNow
    if (!r.canConfirm){
      assert(sumDice(d) !== 8, 'P4: if not confirm, not 8 dice', {fortune, d, r});
      assert(!r.earlyDeath, 'P4: if not confirm, not earlyDeath', {fortune, d, r});
      assert(!r.canSkullIslandNow, 'P4: if not confirm, not skullIslandNow', {fortune, d, r});
    }

    // P5: validateChestSelection nunca debe aceptar skulls
    // (probamos un chest aleatorio)
    const chest = initDiceCounts();
    for (const k of CHEST_ALLOWED) chest[k] = randInt(rng, 0, d[k] || 0);
    if (rng() < 0.1) chest.skull = 1; // 10% forzamos skull para comprobar rechazo
    const v = validateChestSelection(d, chest);
    if ((chest.skull || 0) > 0){
      assert(v.ok === false, 'P5: chest with skull must be invalid', {d, chest, v});
    }
  }
}

export function Tests({ onBack }){
  const [results, setResults] = useState([]);
  const [failLog, setFailLog] = useState('');
  const [running, setRunning] = useState(false);

  const [iters, setIters] = useState(3000);
  const [seed, setSeed] = useState(() => {
    try{
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0];
    }catch{
      return Math.floor(Math.random()*2**32);
    }
  });

  const deterministic = useMemo(() => buildDeterministicTests(), []);

  const runAll = async () => {
    setRunning(true);
    setFailLog('');
    const out = [];
    const fails = [];

    const start = performance.now();

    // 1) Determinísticos
    for (const t of deterministic){
      try{
        t.run();
        out.push({ ...t, pass:true });
      }catch(e){
        out.push({ ...t, pass:false, error: e.message, ctx: e.ctx || null });
        fails.push({ id:t.id, title:t.title, error:e.message, ctx:e.ctx || null, stack:e.stack });
      }
    }

    // 2) Propiedades + fuzz
    const fuzzId = 'PROP-001';
    try{
      runPropertyTests(seed >>> 0, Math.max(0, iters|0));
      out.push({
        id: fuzzId,
        title: `Propiedades + fuzz (${Math.max(0, iters|0)} iter)`,
        doc: 'Invariantes y combinaciones aleatorias reproducibles con semilla.',
        pass: true
      });
    }catch(e){
      out.push({
        id: fuzzId,
        title: `Propiedades + fuzz (${Math.max(0, iters|0)} iter)`,
        doc: 'Invariantes y combinaciones aleatorias reproducibles con semilla.',
        pass: false,
        error: e.message,
        ctx: e.ctx || null
      });
      fails.push({ id:fuzzId, title:'Propiedades + fuzz', error:e.message, ctx:e.ctx || null, stack:e.stack });
    }

    const end = performance.now();
    const ms = Math.round(end - start);

    setResults(out);
    setFailLog(fails.length ? fmt({ seed, iters, fails }) : '');
    setRunning(false);

    // pequeño “resumen” al principio
    const passCount = out.filter(x => x.pass).length;
    const failCount = out.length - passCount;
    console.log(`[Tests] ${passCount} PASS / ${failCount} FAIL in ${ms}ms`, { seed, iters });
  };

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.length - passCount;

  return (
    <div className="card">
      <h2>🧪 Tests</h2>

      <div className={`notice ${failCount === 0 ? 'good' : 'bad'}`}>
        <div className="kv">
          <span>Resumen</span>
          <b>{results.length ? `${passCount}/${results.length} PASS` : 'Pendiente'}</b>
        </div>
        <div className="kv">
          <span>Semilla</span>
          <b style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(seed >>> 0)}</b>
        </div>
      </div>

      <div className="divider" />

      <div className="row" style={{ justifyContent:'space-between' }}>
        <div className="row">
          <label style={{ margin: 0 }}>Fuzz iter.</label>
          <input
            value={iters}
            onChange={(e)=>setIters(parseInt(e.target.value,10) || 0)}
            style={{ width: 120, textAlign:'center' }}
          />
          <button className="btn btn-ghost" onClick={()=>{
            try{
              const a = new Uint32Array(1);
              crypto.getRandomValues(a);
              setSeed(a[0]);
            }catch{
              setSeed(Math.floor(Math.random()*2**32));
            }
          }}>
            Nueva semilla
          </button>
        </div>

        <div className="right">
          <button className="btn btn-primary" onClick={runAll} disabled={running}>
            {running ? 'Ejecutando…' : 'Ejecutar todo'}
          </button>
          <button className="btn btn-ghost" onClick={onBack} disabled={running}>
            ← Volver
          </button>
        </div>
      </div>

      <div className="divider" />

      <div style={{ maxHeight: 520, overflow: 'auto', display:'flex', flexDirection:'column', gap: 10 }}>
        {results.map((t) => (
          <div key={t.id} className={`notice ${t.pass ? 'good' : 'bad'}`}>
            <div className="kv">
              <span><b>{t.id}</b> — {t.title}</span>
              <b>{t.pass ? 'PASS' : 'FAIL'}</b>
            </div>
            <div className="small muted">{t.doc}</div>
            {!t.pass && (
              <div className="small" style={{ marginTop: 6 }}>
                <b>Error:</b> {t.error}
                {t.ctx ? (
                  <pre style={{ whiteSpace:'pre-wrap', marginTop: 8, background:'rgba(0,0,0,.25)', padding: 10, borderRadius: 10 }}>
                    {fmt(t.ctx)}
                  </pre>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {!!failLog && (
        <>
          <div className="divider" />
          <div className="small muted">Debug (copiable):</div>
          <pre style={{ whiteSpace:'pre-wrap', marginTop: 8, background:'rgba(0,0,0,.25)', padding: 10, borderRadius: 10 }}>
            {failLog}
          </pre>
        </>
      )}
    </div>
  );
}
