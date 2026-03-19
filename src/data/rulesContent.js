export const RULES_SECTIONS = [
  {
    emoji: '🎯',
    title: 'Objetivo del Juego',
    items: [
      'Ser el primer jugador en alcanzar 6.000 puntos.',
      'Cuando un jugador llega a 6.000, los demás tienen una última ronda para intentar superarlo.',
      'Si tras la ronda final nadie supera al líder, este gana la partida.'
    ]
  },
  {
    emoji: '🎲',
    title: 'Turno de Juego',
    items: [
      'Al inicio del turno se revela una carta de fortuna que modifica las reglas de puntuación.',
      'Lanza los 8 dados.',
      'Aparta obligatoriamente todas las calaveras.',
      'Elige qué dados conservar y relanza el resto.',
      'Puedes detenerte en cualquier momento y sumar los puntos.',
      'Si acumulas 3 o más calaveras, pierdes todos los puntos del turno (muerte).'
    ]
  },
  {
    emoji: '💰',
    title: 'Puntuación',
    items: [
      'Monedas y Diamantes: 100 puntos cada uno (valor individual).',
      'Sets de dados iguales otorgan puntos extra:',
      '  3 iguales = 100 | 4 iguales = 200 | 5 iguales = 500',
      '  6 iguales = 1.000 | 7 iguales = 2.000 | 8 iguales = 4.000',
      'Cofre completo (8 dados sin calaveras y con puntos): +500 bonus.',
      'Los valores individuales y de sets se acumulan.',
      'Monedas y Diamantes suman tanto su valor individual como en sets.'
    ]
  },
  {
    emoji: '🎴',
    title: 'Cartas de Fortuna',
    items: [
      'Pirata: duplica todos los puntos del turno. En Isla Calavera, la penalización es de 200 por calavera en lugar de 100.',
      'Animales: Monos y Loros se combinan en un único set.',
      'Moneda de Oro: suma +1 moneda automáticamente al inicio del turno.',
      'Diamante: suma +1 diamante automáticamente al inicio del turno.',
      'Calavera (×1): añade 1 calavera al inicio. No se aplica bonus de cofre completo.',
      'Calavera (×2): añade 2 calaveras al inicio. No se aplica bonus de cofre completo.',
      'Hechicera: permite convertir 1 calavera en otro dado (una vez por turno). En esta app se usa en modo "resultado final".',
      'Barco Pirata (×2): si tienes ≥2 sables, +300 puntos. Si no, pierdes 300.',
      'Barco Pirata (×3): si tienes ≥3 sables, +500 puntos. Si no, pierdes 500.',
      'Barco Pirata (×4): si tienes ≥4 sables, +1.000 puntos. Si no, pierdes 1.000.',
      'Botín: puedes guardar dados en el cofre. Si mueres, solo puntúan los dados guardados. No se pueden guardar calaveras.'
    ]
  },
  {
    emoji: '💀',
    title: 'Isla Calavera',
    items: [
      'Se activa si en la primera tirada sacas 4 o más calaveras.',
      'El jugador activo no puntúa en este turno.',
      'Cada calavera resta 100 puntos a todos los rivales.',
      'Puedes seguir lanzando para acumular más calaveras y aumentar la penalización.',
      'Con carta Pirata: la penalización sube a 200 puntos por calavera.'
    ]
  },
  {
    emoji: '⚔️',
    title: 'Barcos Pirata (Detalle)',
    items: [
      'Las cartas de Barco Pirata establecen un desafío de sables.',
      'Si cumples el requisito de sables, ganas el bonus además de tus puntos normales.',
      'Si NO lo cumples, pierdes el valor del barco y no puntúas nada más del turno.',
      'La penalización de barco se aplica incluso si tienes otros dados valiosos.'
    ]
  },
  {
    emoji: '⚙️',
    title: 'Modos de Juego',
    items: [
      'Normal: la puntuación mínima de un jugador es 0 (no puede bajar de 0).',
      'Hardcore: permite puntuaciones negativas. Las penalizaciones de Barco Pirata e Isla Calavera pueden llevar tu marcador por debajo de 0.'
    ]
  }
];
