export interface GameSettings {
  speed: number;     // 1 to 10
  textSize: number;  // 1 to 5 (multiplier)
  spawnRate: number; // ms between words
  wordSpacing: number; // horizontal gap %
}

export interface ActiveWord {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  isPopping: boolean;
}

export enum GameState {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}