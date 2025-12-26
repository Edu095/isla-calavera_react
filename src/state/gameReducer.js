import { TARGET_SCORE, CHEST_ALLOWED } from '../engine/constants.js';
import {
  initDiceCounts,
  computeTurn,
  clampScore,
  applyFortuneBaseDice,
  mergeDice,
  computePointsFromDice,
  validateChestSelection,
  chestAutoSuggest,
} from '../engine/rules.js';

function cryptoRandomId(){
  try{
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return `${a[0].toString(16)}${a[1].toString(16)}`;
  }catch{
    return Math.random().toString(16).slice(2);
  }
}

function randInt(n){ return Math.floor(Math.random() * n); }

function winnerIdFromPlayers(players){
  return players.reduce((a,b)=> (b.score > a.score ? b : a), players[0])?.id ?? null;
}

function startTurn(state){
  const dice = initDiceCounts();
  const fortune = 'none';
  const chest = initDiceCounts();
  return {
    ...state,
    screen: 'turn',
    turn: {
      fortune,
      dice,
      chest,
      computed: computeTurn(state.mode, fortune, dice),
    },
  };
}

export function gameReducer(state, action){
  switch(action.type){
    case 'NAVIGATE': {
      return { ...state, screen: action.screen };
    }

    case 'SET_MODE': {
      const mode = action.mode;
      const computed = computeTurn(mode, state.turn.fortune, state.turn.dice);
      return { ...state, mode, turn: { ...state.turn, computed } };
    }

    case 'SET_NUM_PLAYERS': {
      return { ...state, numPlayers: action.numPlayers };
    }

    case 'GO_NAMES': {
      const players = Array.from({ length: state.numPlayers }, (_, i) => ({
        id: cryptoRandomId(),
        name: `Pirata ${String.fromCharCode(65+i)}`,
        score: 0,
      }));
      return {
        ...state,
        players,
        screen: 'names',
      };
    }

    case 'SET_PLAYER_NAME': {
      const players = state.players.map((p, i) =>
        i === action.index ? { ...p, name: (action.name || '').trim().slice(0,24) || p.name } : p
      );
      return { ...state, players };
    }

    case 'START_GAME': {
      const currentPlayerIndex = randInt(state.players.length);
      const next = {
        ...state,
        currentPlayerIndex,
        round: 1,
        finalPhase: null,
        winnerId: null,
      };
      return startTurn(next);
    }

    case 'TURN_SET_FORTUNE': {
      const fortune = action.fortune;
      const dice = initDiceCounts();
      const chest = initDiceCounts();
      return {
        ...state,
        turn: {
          fortune,
          dice,
          chest,
          computed: computeTurn(state.mode, fortune, dice),
        }
      };
    }

    case 'TURN_ADJUST_DIE': {
      const { key, delta } = action;
      const dice = { ...state.turn.dice };
      dice[key] = Math.max(0, (dice[key] || 0) + delta);
      if (Object.values(dice).reduce((a,b)=>a+b,0) > 8) return state;

      let chest = state.turn.chest;
      if (state.turn.fortune === 'chest'){
        chest = { ...chest };
        for (const k of CHEST_ALLOWED){
          chest[k] = Math.min(chest[k] || 0, dice[k] || 0);
        }
        chest.skull = 0;
      }

      return {
        ...state,
        turn: {
          ...state.turn,
          dice,
          chest,
          computed: computeTurn(state.mode, state.turn.fortune, dice),
        }
      };
    }

    case 'CHEST_SET_COUNT': {
      if (state.turn.fortune !== 'chest') return state;
      const { key, value } = action;
      if (!CHEST_ALLOWED.includes(key)) return state;

      const max = state.turn.dice[key] || 0;
      const n = Math.max(0, Math.min(max, parseInt(value,10) || 0));

      const chest = { ...state.turn.chest, [key]: n, skull: 0 };
      return { ...state, turn: { ...state.turn, chest } };
    }

    case 'CHEST_AUTO': {
      if (state.turn.fortune !== 'chest') return state;
      const chest = chestAutoSuggest(state.turn.dice);
      return { ...state, turn: { ...state.turn, chest } };
    }

    case 'CHEST_CLEAR': {
      if (state.turn.fortune !== 'chest') return state;
      return { ...state, turn: { ...state.turn, chest: initDiceCounts() } };
    }

    case 'SKULLISLAND_ADJUST': {
      const delta = action.delta;
      const v = Math.max(0, (state.skullIsland.collectedSkulls || 0) + delta);
      return { ...state, skullIsland: { ...state.skullIsland, collectedSkulls: v } };
    }

    case 'CONFIRM_TURN': {
      const c = state.turn.computed;
      if (!c?.canConfirm) return state;

      // Isla Calavera -> pantalla dedicada
      if (c.canSkullIsland){
        return {
          ...state,
          screen: 'skullIsland',
          skullIsland: { collectedSkulls: c.skullIslandBaseSkulls },
        };
      }

      const idx = state.currentPlayerIndex;
      const players = state.players.map(p => ({ ...p }));
      const player = players[idx];
      const fortune = state.turn.fortune;
      const physical = state.turn.dice;

      // Muerte temprana (no chest)
      if (c.earlyDeath && fortune !== 'chest'){
        return advanceAfterScoring({ ...state, players }, idx);
      }

      // Botín
      if (fortune === 'chest'){
        if ((physical.skull || 0) >= 4){
          // ya habría entrado por canSkullIsland arriba, así que aquí no debería llegar
          return state;
        }

        if (Object.values(physical).reduce((a,b)=>a+b,0) !== 8){
          // en UI se mostrará aviso; aquí no cambia estado
          return { ...state, lastError: 'Con Botín debes introducir 8 dados (salvo Isla Calavera).' };
        }

        const v = validateChestSelection(physical, state.turn.chest);
        if (!v.ok){
          return { ...state, lastError: v.reasons.join(' ') };
        }

        const bust = (physical.skull || 0) >= 3;
        if (bust){
          const chestDice = { ...state.turn.chest, skull: 0 };
          const tmp = computePointsFromDice(state.mode, 'none', chestDice);
          const gainedNoChestBonus = tmp.points - (tmp.fullChestBonus || 0);
          player.score = clampScore(state.mode, player.score + gainedNoChestBonus);
          return advanceAfterScoring({ ...state, players }, idx);
        }

        player.score = clampScore(state.mode, player.score + c.points);
        return advanceAfterScoring({ ...state, players }, idx);
      }

      // Normal
      player.score = clampScore(state.mode, player.score + c.points);

      // Magia 9 dados (como en tu html) [file:127]
      const base = applyFortuneBaseDice(fortune);
      const all = mergeDice(base, physical);
      const magicWin =
        (fortune === 'gold' && all.gold === 9) ||
        (fortune === 'diamond' && all.diamond === 9);

      if (magicWin){
        return { ...state, players, screen:'finished', winnerId: player.id };
      }

      return advanceAfterScoring({ ...state, players }, idx);
    }

    case 'APPLY_SKULLISLAND': {
      const idx = state.currentPlayerIndex;
      const players = state.players.map(p => ({ ...p }));
      const active = players[idx];

      const perSkull = (state.turn.fortune === 'pirate') ? 200 : 100;
      const skulls = state.skullIsland.collectedSkulls || 0;

      for (const p of players){
        if (p.id === active.id) continue;
        p.score = clampScore(state.mode, p.score - perSkull * skulls);
      }

      // avanzar turno
      const next = advanceIndex({ ...state, players });
      return startTurn(next);
    }

    case 'RESET_GAME': {
      // simple: recarga equivalente
      return action.initialState;
    }

    default:
      return state;
  }
}

function advanceIndex(state){
  const next = { ...state };
  next.currentPlayerIndex = (next.currentPlayerIndex + 1) % next.players.length;
  if (next.currentPlayerIndex === 0) next.round += 1;
  return next;
}

function advanceAfterScoring(state, scoringPlayerIndex){
  // Final phase (idéntico a tu lógica) [file:127]
  const next = { ...state };

  const triggerPlayer = next.players[scoringPlayerIndex];

  if (!next.finalPhase && triggerPlayer.score >= TARGET_SCORE){
    next.finalPhase = { triggerPlayerId: triggerPlayer.id, turnsRemaining: next.players.length - 1, leaderExtraTurn: false };
  } else if (next.finalPhase){
    if (triggerPlayer.id !== next.finalPhase.triggerPlayerId){
      next.finalPhase.turnsRemaining -= 1;
    }
  }

  const advanced = advanceIndex(next);

  if (advanced.finalPhase && advanced.finalPhase.turnsRemaining <= 0){
    const trigger = advanced.players.find(p => p.id === advanced.finalPhase.triggerPlayerId);
    const best = advanced.players.reduce((a,b)=> (b.score > a.score ? b : a), advanced.players[0]);

    if (best.id !== trigger.id && !advanced.finalPhase.leaderExtraTurn){
      advanced.finalPhase.leaderExtraTurn = true;
      advanced.currentPlayerIndex = advanced.players.findIndex(p => p.id === trigger.id);
      return startTurn(advanced);
    }

    advanced.screen = 'finished';
    advanced.winnerId = best.id;
    return advanced;
  }

  return startTurn(advanced);
}
