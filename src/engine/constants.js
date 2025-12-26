export const DICE_TYPES = [
    { key: 'skull', label: 'Calavera', emoji: '💀' },
    { key: 'saber', label: 'Sable', emoji: '🗡️' },
    { key: 'monkey', label: 'Mono', emoji: '🐒' },
    { key: 'parrot', label: 'Loro', emoji: '🦜' },
    { key: 'gold', label: 'Moneda', emoji: '🪙' },
    { key: 'diamond', label: 'Diamante', emoji: '💎' },
  ];
  
  export const CHEST_ALLOWED = ['saber', 'monkey', 'parrot', 'gold', 'diamond'];
  
  export const FORTUNE = [
    { key:'none', label:'Sin carta / Normal' },
    { key:'pirate', label:'Pirata (duplica puntos; Isla Calavera -200 por calavera)' },
    { key:'animals', label:'Animales (Monos+Loros combinan juntos)' },
    { key:'gold', label:'Moneda de Oro (+1 moneda al inicio)' },
    { key:'diamond', label:'Diamante (+1 diamante al inicio)' },
    { key:'skull1', label:'Calavera (+1 calavera al inicio; no hay bono)' },
    { key:'skull2', label:'Calavera (+2 calaveras al inicio; no hay bono)' },
    { key:'sorceress', label:'Hechicera (sin efecto en modo “resultado final”)' },
    { key:'ship2', label:'Barco Pirata (>=2 sables: +300; si no, -300)' },
    { key:'ship3', label:'Barco Pirata (>=3 sables: +500; si no, -500)' },
    { key:'ship4', label:'Barco Pirata (>=4 sables: +1000; si no, -1000)' },
    { key:'chest', label:'Botín (guardar dados; si mueres puntúan los guardados)' },
  ];
  
  export const SET_POINTS = { 3:100, 4:200, 5:500, 6:1000, 7:2000, 8:4000 };
  export const TARGET_SCORE = 6000;
  