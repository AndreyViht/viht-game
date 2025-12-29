
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Diamond, Bomb, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GameRulesModal } from '../../components/ui/GameRulesModal';
import { GameSettings } from '../../types';

interface MinesGameProps {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

const GRID_SIZE = 25;
const MINE_COUNTS = [1, 3, 5, 10, 24];

export const MinesGame: React.FC<MinesGameProps> = ({ balance, onGameEnd, settings }) => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [grid, setGrid] = useState<boolean[]>(Array(GRID_SIZE).fill(false)); 
  const [revealed, setRevealed] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [showRules, setShowRules] = useState(false);

  const RULES = [
    "Выберите сумму ставки и количество мин.",
    "Открывайте клетки (нажимайте на серые квадраты).",
    "Под клетками спрятаны алмазы или мины.",
    "Каждый алмаз увеличивает ваш выигрыш.",
    "Если попадете на мину — ставка сгорает.",
    "Нажмите 'ЗАБРАТЬ', чтобы сохранить выигрыш в любой момент."
  ];

  const startGame = () => {
    if (balance < betAmount) return;
    const newGrid = Array(GRID_SIZE).fill(false);
    let placedMines = 0;
    while (placedMines < minesCount) {
      const idx = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[idx]) {
        newGrid[idx] = true;
        placedMines++;
      }
    }
    setGrid(newGrid);
    setRevealed(Array(GRID_SIZE).fill(false));
    setIsPlaying(true);
    setGameOver(false);
    setCurrentMultiplier(1.0);
  };

  const handleCashout = () => {
    if (!isPlaying || gameOver) return;
    const winAmount = betAmount * currentMultiplier;
    onGameEnd('Mines', betAmount, winAmount, currentMultiplier);
    setIsPlaying(false);
    setRevealed(Array(GRID_SIZE).fill(true));
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || revealed[index] || gameOver) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index]) {
      setGameOver(true);
      setIsPlaying(false);
      setRevealed(Array(GRID_SIZE).fill(true));
      if (navigator.vibrate) navigator.vibrate(200);
      onGameEnd('Mines', betAmount, 0, 0);
    } else {
      const tilesRevealed = newRevealed.filter((r, i) => r && !grid[i]).length;
      const nextMultiplier = currentMultiplier * (1 + (minesCount / (GRID_SIZE - tilesRevealed)) * 0.9); 
      setCurrentMultiplier(nextMultiplier);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto pb-4 px-4 min-h-[85vh]">
      <div className="flex justify-between items-center">
        <h2 className="font-black italic text-3xl uppercase tracking-tighter text-white flex items-center gap-2 drop-shadow-lg">
           МИНЫ
        </h2>
        <button onClick={() => setShowRules(true)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
          <HelpCircle size={24} />
        </button>
      </div>

      {/* Grid Container - Сделан максимально широким */}
      <div className="w-full aspect-square bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-3 relative shadow-2xl flex-shrink-0">
        <div className="grid grid-cols-5 gap-2 w-full h-full">
          {Array(GRID_SIZE).fill(0).map((_, i) => (
            <motion.button
              key={i}
              whileTap={!revealed[i] && isPlaying ? { scale: 0.9 } : {}}
              onClick={() => handleTileClick(i)}
              className={`rounded-xl relative overflow-hidden transition-all duration-100 flex items-center justify-center border-b-[6px] active:border-b-0 active:translate-y-1.5
              ${revealed[i]
                  ? grid[i] 
                    ? 'bg-red-500 border-red-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' // Mine
                    : 'bg-emerald-400 border-emerald-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]' // Gem
                  : isPlaying 
                    ? 'bg-slate-700 border-slate-900 hover:bg-slate-600 cursor-pointer' // Active Tile
                    : 'bg-slate-800/50 border-slate-900/50 opacity-40 cursor-not-allowed' // Disabled Tile
              }`}
              disabled={!isPlaying && !revealed[i]}
            >
              {revealed[i] ? (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                  {grid[i] ? (
                    <Bomb className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
                  ) : (
                    <Diamond className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" fill="currentColor" />
                  )}
                </motion.div>
              ) : (
                 /* Dot for texture */
                 <div className="w-1.5 h-1.5 rounded-full bg-black/20"></div>
              )}
            </motion.button>
          ))}
        </div>
        
        {!isPlaying && !gameOver && !revealed.some(r => r) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-black/80 backdrop-blur-md px-8 py-4 rounded-2xl border border-brand/50 text-white font-black text-xl animate-pulse shadow-2xl">
                    СДЕЛАЙТЕ СТАВКУ
                </div>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-auto bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
         {!isPlaying && (
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/40 border border-white/5 rounded-2xl px-4 py-3">
               <label className="text-slate-500 text-[10px] font-bold uppercase block mb-1">Ставка</label>
               <input 
                 type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))}
                 className="w-full bg-transparent text-white font-mono font-bold text-xl outline-none"
               />
             </div>
             <div className="bg-black/40 border border-white/5 rounded-2xl px-4 py-3">
               <label className="text-slate-500 text-[10px] font-bold uppercase block mb-1">Мины</label>
               <select 
                 value={minesCount} onChange={(e) => setMinesCount(Number(e.target.value))}
                 className="w-full bg-transparent text-white font-bold text-xl outline-none appearance-none cursor-pointer"
               >
                 {MINE_COUNTS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
               </select>
             </div>
           </div>
         )}

         {isPlaying ? (
           <Button onClick={handleCashout} variant="success" className="w-full h-16 text-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-between px-8 border-t-4 border-green-400 active:border-t-0 active:translate-y-1">
             <span className="font-black">ЗАБРАТЬ</span>
             <span className="font-mono font-bold">{(betAmount * currentMultiplier).toFixed(2)} ₽</span>
           </Button>
         ) : (
           <Button onClick={startGame} variant="primary" className="w-full h-16 text-2xl font-black uppercase tracking-wider shadow-lg">
             ИГРАТЬ
           </Button>
         )}
      </div>
      
      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Мины" rules={RULES} />
    </div>
  );
};
