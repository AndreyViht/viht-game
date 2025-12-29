export enum View {
  HOME = 'HOME',
  GAMES_LIST = 'GAMES_LIST',
  CRASH = 'CRASH',
  MINES = 'MINES',
  SLOTS = 'SLOTS',
  COINFLIP = 'COINFLIP',
  DICE = 'DICE',
  ROULETTE = 'ROULETTE',
  KENO = 'KENO',
  HILO = 'HILO',
  WALLET = 'WALLET',
  ADMIN = 'ADMIN',
}

export interface UserState {
  balance: number;
}

export type GameId = 'crash' | 'mines' | 'slots' | 'coinflip' | 'dice' | 'roulette' | 'keno' | 'hilo';

export interface GameHistoryItem {
  id: number;
  game: string;
  bet: number;
  win: number;
  coefficient: number;
  created_at: string;
}

export interface GameSettings {
  game_id: string;
  win_chance: number; // 0.0 to 1.0
  min_mult: number;
  max_mult: number;
}

export interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  image: string;
  view: View;
  color: string;
}