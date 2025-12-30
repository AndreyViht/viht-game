
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
  CASES = 'CASES',
  MINING = 'MINING',
  WALLET = 'WALLET',
  ADMIN = 'ADMIN',
  SHOP = 'SHOP',
  LEADERS = 'LEADERS'
}

export interface UserState {
  balance: number;
}

export type GameId = 'crash' | 'mines' | 'slots' | 'coinflip' | 'dice' | 'roulette' | 'keno' | 'hilo' | 'cases';

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

export interface ShopItem {
  id: string;
  type: 'decoration' | 'booster';
  name: string;
  description: string;
  cost: number;
  effect?: string; // CSS class for decoration or logic key for booster
  icon?: any;
}

export interface Booster {
    id: string;
    multiplier: number; // e.g., 3 for x3
    saveOnLoss: boolean; // if true, booster is not consumed on loss (unless insurance)
    label: string;
}
