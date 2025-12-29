
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { GameSettings } from '../../types';
import { HelpCircle, Trophy } from 'lucide-react';
import { GameRulesModal } from '../../components/ui/GameRulesModal';
import { motion } from 'framer-motion';

interface Props {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

export const KenoGame: React.FC<Props> = ({ balance, onGameEnd, settings }) => {
  const [bet, setBet] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const RULES = [
      "Выберите от 1 до 5 чисел на поле.",
      "Нажмите 'ИГРАТЬ', чтобы запустить лотерею.",
      "Система выберет 10 случайных чисел.",
      "Чем больше совпадений с вашими числами, тем больше выигрыш."
  ];

  const PAYOUTS = [0, 0, 1.5, 3, 10, 50]; // Index = кол-во совпадений

  const toggleNum = (n: number) => {
      if (playing) return;
      if (selected.includes(n)) setSelected(selected.filter(i => i !== n));
      else if (selected.length < 5) setSelected([...selected, n]);
  };

  const play = () => {
      if (balance < bet || selected.length === 0 || playing) return;
      setPlaying(true);
      setDrawn([]);
      setLastWin(0);

      const delay = 100; // ms per draw
      const newDrawn: number[] = [];
      
      // Generate numbers
      while(newDrawn.length < 10) {
          const r = Math.floor(Math.random() * 20) + 1;
          if (!newDrawn.includes(r)) newDrawn.push(r);
      }

      // Animate drawing
      let currentDrawIdx = 0;
      const interval = setInterval(() => {
          setDrawn(prev => [...prev, newDrawn[currentDrawIdx]]);
          currentDrawIdx++;
          if (navigator.vibrate) navigator.vibrate(20);

          if (currentDrawIdx >= 10) {
              clearInterval(interval);
              finishGame(newDrawn);
          }
      }, delay);
  };

  const finishGame = (finalDrawn: number[]) => {
      const hits = selected.filter(s => finalDrawn.includes(s)).length;
      const multiplier = PAYOUTS[hits] || 0;
      const winAmount = bet * multiplier;

      setLastWin(winAmount);
      setPlaying(false);
      onGameEnd('Keno', bet, winAmount, multiplier);
      
      if (winAmount > 0 && navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  // Подсчет текущих совпадений для UI
  const currentHits = selected.filter(s => drawn.includes(s)).length;

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-4 min-h-[85vh]">
        <div className="flex w-full justify-between items-center">
            <h2 className="text-3xl font-black italic uppercase text-purple-500 text-center tracking-tighter">КЕНО 20</h2>
            <button onClick={() => setShowRules(true)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
               <HelpCircle size={20} />
            </button>
        </div>
        
        {/* Payout Bar */}
        <div className="flex justify-between items-center bg-white/5 rounded-xl p-2 mb-2 gap-1 overflow-x-auto">
            {PAYOUTS.map((mult, idx) => {
                if (idx === 0) return null; // Skip 0 hits
                const active = idx <= currentHits;
                return (
                    <div key={idx} className={`flex-1 flex flex-col items-center p-1 rounded-lg transition-all ${active ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-black/20 text-slate-600'}`}>
                        <span className="text-[10px] font-bold">{idx}x</span>
                        <span className="font-mono font-bold text-sm">x{mult}</span>
                    </div>
                )
            })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-5 gap-3 bg-black/40 p-4 rounded-3xl border border-white/10 shadow-inner">
            {Array.from({length: 20}, (_, i) => i + 1).map(n => {
                const isSelected = selected.includes(n);
                const isDrawn = drawn.includes(n);
                const isHit = isSelected && isDrawn;
                
                return (
                    <motion.button
                        key={n}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleNum(n)}
                        className={`aspect-square rounded-xl font-black text-lg transition-all flex items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 relative ${
                            isHit 
                                ? 'bg-green-500 border-green-700 text-white shadow-[0_0_15px_rgba(34,197,94,0.8)] z-10' 
                                : isDrawn 
                                    ? 'bg-slate-700 border-slate-900 text-slate-400' 
                                    : isSelected 
                                        ? 'bg-purple-600 border-purple-800 text-white shadow-lg' 
                                        : 'bg-slate-800 border-slate-950 text-slate-500 hover:bg-slate-750'
                        }`}
                        disabled={playing}
                    >
                        {n}
                        {isHit && <motion.div layoutId="hit-glow" className="absolute inset-0 rounded-xl bg-green-400/30 blur-md" />}
                    </motion.button>
                )
            })}
        </div>
        
        {lastWin > 0 && !playing && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl text-center">
                <p className="text-green-400 font-black text-xl flex items-center justify-center gap-2">
                    <Trophy size={20} /> ВЫИГРЫШ: {lastWin} ₽
                </p>
            </motion.div>
        )}

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl flex items-center justify-between gap-4 mt-auto border border-white/10 shadow-xl">
            <div className="flex flex-col pl-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Ставка</span>
                <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent text-white font-bold text-2xl outline-none w-20" disabled={playing} />
            </div>
            <Button onClick={play} disabled={playing || selected.length === 0} variant={playing ? "secondary" : "primary"} className="px-8 h-14 text-lg">
                {playing ? "РОЗЫГРЫШ..." : "ИГРАТЬ"}
            </Button>
       </div>
       
       <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Кено" rules={RULES} />
    </div>
  );
};
