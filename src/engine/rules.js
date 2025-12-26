import { CHEST_ALLOWED, SET_POINTS } from './constants.js';

export function initDiceCounts(){
  return { skull:0, saber:0, monkey:0, parrot:0, gold:0, diamond:0 };
}

export function totalDice(d){
  return Object.values(d).reduce((a,b)=>a+b,0);
}

export function clampScore(mode, score){
  if (mode === 'hardcore') return score;
  return Math.max(0, score);
}

export function applyFortuneBaseDice(fortuneKey){
  const base = initDiceCounts();
  if (fortuneKey === 'gold') base.gold += 1;
  if (fortuneKey === 'diamond') base.diamond += 1;
  if (fortuneKey === 'skull1') base.skull += 1;
  if (fortuneKey === 'skull2') base.skull += 2;
  return base;
}

export function mergeDice(base, picked){
  const out = initDiceCounts();
  for (const k of Object.keys(out)){
    out[k] = (base[k] || 0) + (picked[k] || 0);
  }
  return out;
}

export function validateChestSelection(finalDicePhysical, chestDice){
  if ((chestDice.skull || 0) !== 0){
    return { ok:false, sum:0, reasons:['Botín: no se pueden guardar calaveras.'] };
  }
  let sum = 0;
  for (const k of CHEST_ALLOWED){
    const cv = chestDice[k] || 0;
    const fv = finalDicePhysical[k] || 0;
    sum += cv;
    if (cv > fv){
      return { ok:false, sum, reasons:[`Botín: has marcado más de los que han salido para "${k}".`] };
    }
  }
  if (sum > 8){
    return { ok:false, sum, reasons:['Botín: no puede haber más de 8 dados.'] };
  }
  return { ok:true, sum, reasons:[] };
}

export function computePointsFromDice(mode, fortuneKey, allDiceCounts){
  const notes = [];
  const d = { ...allDiceCounts };

  const skullsTotal = d.skull;
  const bust = skullsTotal >= 3;
  const pirateMultiplier = (fortuneKey === 'pirate') ? 2 : 1;

  if (bust){
    return { points:0, fullChestBonus:0, pirateMultiplier, bust:true, notes:['3+ calaveras: turno puntúa 0.'] };
  }

  const faceValue = (d.gold + d.diamond) * 100;

  const setTypes = [];
  if (fortuneKey === 'animals'){
    const animals = d.monkey + d.parrot;
    setTypes.push({ key:'animals', n: animals });
    notes.push('Carta Animales: monos+loros combinan en un único set.');
  } else {
    setTypes.push({ key:'monkey', n: d.monkey });
    setTypes.push({ key:'parrot', n: d.parrot });
  }
  setTypes.push({ key:'saber', n: d.saber });
  setTypes.push({ key:'gold', n: d.gold });
  setTypes.push({ key:'diamond', n: d.diamond });

  let setScore = 0;
  for (const t of setTypes){
    if (t.n >= 3) setScore += SET_POINTS[t.n] || 0;
  }

  let shipReq = null;
  let shipValue = 0;
  if (fortuneKey === 'ship2'){ shipReq = 2; shipValue = 300; }
  if (fortuneKey === 'ship3'){ shipReq = 3; shipValue = 500; }
  if (fortuneKey === 'ship4'){ shipReq = 4; shipValue = 1000; }

  let shipBonusOrPenalty = 0;
  if (shipReq !== null){
    if (d.saber >= shipReq){
      shipBonusOrPenalty = shipValue;
      notes.push(`Barco Pirata: cumples ${shipReq} sables, +${shipValue}.`);
    } else {
      shipBonusOrPenalty = -shipValue;
      notes.push(`Barco Pirata: no llegas a ${shipReq} sables, 0 puntos y -${shipValue}.`);
      const p = clampScore(mode, shipBonusOrPenalty * pirateMultiplier);
      return { points:p, fullChestBonus:0, pirateMultiplier, bust:false, notes };
    }
  }

  let fullChestBonus = 0;
  const anyPoints = (faceValue + setScore + Math.max(0, shipBonusOrPenalty)) > 0;
  if (d.skull === 0 && anyPoints){
    fullChestBonus = 500;
    notes.push('Cofre completo: +500.');
  }

  let points = (faceValue + setScore + fullChestBonus + shipBonusOrPenalty) * pirateMultiplier;

  if ((fortuneKey === 'skull1' || fortuneKey === 'skull2') && fullChestBonus > 0){
    points -= fullChestBonus * pirateMultiplier;
    fullChestBonus = 0;
    notes.push('Carta Calavera: no hay bono de cofre completo.');
  }

  return { points, fullChestBonus, pirateMultiplier, bust:false, notes };
}

export function computeSkullIslandPenaltyPerSkull(fortuneKey){
  if (fortuneKey === 'pirate') return 200;
  return 100;
}

// Opción A (ayuda manual)
export function chestAutoSuggest(physicalDice){
  const chest = initDiceCounts();

  const candidates = ['saber','monkey','parrot'];
  let bestKey = null;
  let bestN = 0;
  for (const k of candidates){
    const n = physicalDice[k] || 0;
    if (n > bestN){ bestN = n; bestKey = k; }
  }

  if (bestKey && bestN >= 3){
    chest[bestKey] = bestN;
  }

  chest.gold = physicalDice.gold || 0;
  chest.diamond = physicalDice.diamond || 0;

  let used = (chest.saber + chest.monkey + chest.parrot + chest.gold + chest.diamond);
  let remaining = 8 - used;

  if (remaining > 0){
    const others = candidates
      .filter(k => k !== bestKey)
      .sort((a,b)=>(physicalDice[b]||0)-(physicalDice[a]||0));

    for (const k of others){
      if (remaining <= 0) break;
      const n = physicalDice[k] || 0;
      const add = Math.min(n, remaining);
      chest[k] = add;
      remaining -= add;
    }
  }

  chest.skull = 0;
  for (const k of CHEST_ALLOWED){
    chest[k] = Math.min(chest[k] || 0, physicalDice[k] || 0);
  }
  return chest;
}

/**
 * computeTurn con tu patch canSkullIslandNow:
 * - si skullsTotal >= 4 => Isla Calavera, aunque falten dados (interpretación UX “resultado final”).
 */
export function computeTurn(mode, fortuneKey, physicalDice){
  const notes = [];
  const baseFromCard = applyFortuneBaseDice(fortuneKey);
  const all = mergeDice(baseFromCard, physicalDice);

  const diceTotal = totalDice(physicalDice);
  const skullsTotal = all.skull;

  const canSkullIslandNow = (skullsTotal >= 4);
  const earlyDeath = (skullsTotal >= 3) && !canSkullIslandNow && (fortuneKey !== 'chest');
  const canConfirm = (diceTotal === 8) || earlyDeath || canSkullIslandNow;

  const computed = {
    canConfirm,
    totalDice: diceTotal,
    skullsTotal,
    points: 0,
    notes,
    bust: skullsTotal >= 3,
    canSkullIsland: false,
    skullIslandBaseSkulls: 0,
    earlyDeath,
    canSkullIslandNow,
  };

  if (canSkullIslandNow){
    computed.canSkullIsland = true;
    computed.skullIslandBaseSkulls = skullsTotal;
    computed.points = 0;
    notes.push('Isla Calavera activada: los demás símbolos no puntúan.');
    return computed;
  }

  if (!canConfirm){
    notes.push(`Selecciona ${8 - diceTotal} dado(s) más para confirmar.`);
    return computed;
  }

  if (earlyDeath){
    computed.points = 0;
    notes.push('3+ calaveras: turno finaliza inmediatamente y puntúas 0.');
    return computed;
  }

  const normal = computePointsFromDice(mode, fortuneKey, all);
  computed.points = normal.points;
  notes.push(...normal.notes);
  return computed;
}
