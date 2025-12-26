import { initDiceCounts, computeTurn } from '../engine/rules.js';

export function createInitialState(){
  return {
    screen: 'setup', // setup | names | turn | skullIsland | finished | tests
    mode: 'normal',
    numPlayers: 2,
    players: [],
    currentPlayerIndex: 0,
    round: 1,
    finalPhase: null,
    winnerId: null,

    turn: {
      fortune: 'none',
      dice: initDiceCounts(),
      chest: initDiceCounts(),
      computed: computeTurn('normal', 'none', initDiceCounts()),
    },

    skullIsland: { collectedSkulls: 0 },
  };
}
