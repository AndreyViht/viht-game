
import React, { useState } from 'react';
import { Box, HelpCircle, Trophy, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface CasesProps {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
}

interface CaseType {
    id: string;
    name: string;
    price: number;
    color: string;
    image: string;
    minWin: number;
    maxWin: number;
}

const CASES_DATA: CaseType[] = [
    { id: 'poor', name: 'Бомж Кейс', price: 100, color: 'from-slate-500 to-slate-700', image: '📦', minWin: 10, maxWin: 500 },
    { id: 'rich', name: 'Мажор', price: 1000, color: 'from-yellow-500 to-amber-700', image: '💼', minWin: 200, maxWin: 5000 },
    { id: 'royal', name: 'Олигарх', price: 10000, color: 'from-purple-600 to-indigo-800', image: '👑', minWin: 3000, maxWin: 100000 },
];

export const Cases: React.FC<CasesProps> = ({ balance, onGameEnd }) => {
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const openCase = () => {
      if (!selectedCase || balance < selectedCase.price || isOpening) return;
      
      setIsOpening(true);
      setWinAmount(null);
      
      // Calculate Win Logic
      // 60% chance to lose (get 10% - 80% of bet)
      // 30% chance to return bet (90% - 120%)
      // 10% chance to jackpot (200% - maxWin)
      
      const r = Math.random();
      let win = 0;
      
      if (r < 0.6) {
          // Lose
          win = Math.floor(selectedCase.price * (0.1 + Math.random() * 0.7)); 
      } else if (r < 0.9) {
          // Breakeven-ish
          win = Math.floor(selectedCase.price * (0.9 + Math.random() * 0.3));
      } else {
          // Jackpot
          // Linear interpolation between 2x bet and maxWin
          const t = Math.random(); // 0 to 1
          const minJackpot = selectedCase.price * 2;
          win = Math.floor(minJackpot + (selectedCase.maxWin - minJackpot) * (t * t)); // Quadratic bias towards lower jackpot
      }
      
      // Ensure bounds
      win = Math.max(selectedCase.minWin, Math.min(win, selectedCase.maxWin));

      // Animation delay
      setTimeout(() => {
          setWinAmount(win);
          setIsOpening(false);
          const coeff = win / selectedCase.price;
          onGameEnd('Case Opening', selectedCase.price, win, coeff);
          if (win > selectedCase.price && navigator.vibrate) navigator.vibrate(200);
      }, 3000);
  };

  return (
    <div className="p-4 pb-24 min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-black italic uppercase text-white mb-8 flex items-center gap-2">
            <Box size={32} className="text-yellow-500" /> КЕЙСЫ
        </h1>

        <div className="flex-1 w-full max-w-md flex flex-col justify-center relative">
            
            {/* Case Display Area */}
            <div className="h-80 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                    {winAmount !== null ? (
                        <motion.div 
                           key="win"
                           initial={{ scale: 0, rotate: -180 }}
                           animate={{ scale: 1, rotate: 0 }}
                           className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        >
                            <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                            <div className="text-slate-400 text-sm font-bold uppercase">ВЫИГРЫШ</div>
                            <div className="text-5xl font-black text-white font-mono">{winAmount} ₽</div>
                            <Button onClick={() => setWinAmount(null)} className="mt-6" size="sm">ОК</Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedCase ? selectedCase.id : 'none'}
                            animate={isOpening ? {
                                x: [-5, 5, -5, 5, 0],
                                rotate: [-2, 2, -2, 2, 0],
                                scale: [1, 1.05, 1],
                            } : {}}
                            transition={isOpening ? { duration: 0.2, repeat: Infinity } : {}}
                            className="relative"
                        >
                            {selectedCase ? (
                                <div className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${selectedCase.color} flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 relative overflow-hidden group`}>
                                    <div className="text-9xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                                        {selectedCase.image}
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 blur-3xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                </div>
                            ) : (
                                <div className="text-slate-500 text-sm font-bold uppercase animate-pulse">Выберите кейс</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            {selectedCase && !winAmount && (
                 <div className="bg-[#151517] p-6 rounded-3xl border border-white/10 shadow-xl text-center mb-8">
                     <h2 className="text-2xl font-black text-white uppercase italic mb-1">{selectedCase.name}</h2>
                     <p className="text-xs text-slate-500 font-bold mb-4">Возможный выигрыш: {selectedCase.minWin} - {selectedCase.maxWin} ₽</p>
                     
                     <Button 
                        onClick={openCase} 
                        disabled={isOpening || balance < selectedCase.price}
                        className={`w-full h-16 text-xl font-black uppercase tracking-wider ${isOpening ? 'opacity-50 cursor-not-allowed' : ''}`}
                        variant="gold"
                     >
                         {isOpening ? "ОТКРЫВАЕМ..." : `ОТКРЫТЬ ЗА ${selectedCase.price} ₽`}
                     </Button>
                 </div>
            )}
        </div>

        {/* Case Selector */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            {CASES_DATA.map(c => (
                <button
                    key={c.id}
                    onClick={() => { setSelectedCase(c); setWinAmount(null); }}
                    disabled={isOpening}
                    className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${selectedCase?.id === c.id ? 'border-white bg-white/10 scale-105' : 'border-white/5 bg-white/5 opacity-70'}`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-20`}></div>
                    <div className="text-4xl mb-2 relative z-10">{c.image}</div>
                    <div className="text-xs font-bold text-white relative z-10">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono relative z-10">{c.price} ₽</div>
                </button>
            ))}
        </div>
    </div>
  );
};
