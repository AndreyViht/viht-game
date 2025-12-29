
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { GameSettings } from '../../types';
import { Coins, Trophy, HelpCircle } from 'lucide-react';
import { GameRulesModal } from '../../components/ui/GameRulesModal';

interface Props {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

export const CoinFlipGame: React.FC<Props> = ({ balance, onGameEnd, settings }) => {
  const [bet, setBet] = useState(10);
  const [choice, setChoice] = useState<'heads' | 'tails' | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [showRules, setShowRules] = useState(false);

  const RULES = [
      "Выберите сторону монеты: Орел или Решка.",
      "Сделайте ставку и нажмите 'БРОСОК'.",
      "Если монета упадет вашей стороной, вы удваиваете ставку (x2)."
  ];

  const flip = async () => {
    if (!choice || balance < bet || flipping) return;
    setFlipping(true);
    setResult(null);
    
    // Determine winner
    const winChance = settings?.win_chance ?? 0.5;
    const isWin = Math.random() < winChance;
    const outcome = isWin ? choice : (choice === 'heads' ? 'tails' : 'heads');
    
    // Animation
    setTimeout(() => {
        setResult(outcome);
        setFlipping(false);
        const winAmount = isWin ? bet * 2 : 0;
        onGameEnd('CoinFlip', bet, winAmount, isWin ? 2 : 0);
        if(isWin && navigator.vibrate) navigator.vibrate(100);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col items-center gap-6 min-h-[80vh] justify-center">
       <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
                <Coins className="text-yellow-500" size={32} />
                <h2 className="text-3xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">МОНЕТКА</h2>
            </div>
            <button onClick={() => setShowRules(true)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
                <HelpCircle size={18} />
             </button>
       </div>
       
       {/* 3D Coin Container */}
       <div className="h-64 w-64 relative perspective-1000 my-8">
          <motion.div 
            style={{ transformStyle: 'preserve-3d' }}
            animate={flipping ? { 
                rotateY: [0, 720, 1440, 2160 + (result === 'tails' ? 180 : 0)], 
                y: [0, -100, 0] 
            } : { 
                rotateY: result === 'tails' ? 180 : 0 
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
             {/* Heads Side (Front) */}
             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-4 border-yellow-200 shadow-[0_0_50px_rgba(234,179,8,0.6)] flex items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                 <div className="w-[90%] h-[90%] rounded-full border-2 border-dashed border-yellow-800/50 flex items-center justify-center">
                    <span className="text-8xl select-none">🦅</span>
                 </div>
                 <span className="absolute bottom-6 text-xs font-black tracking-widest text-yellow-900 uppercase">ОРЕЛ</span>
             </div>

             {/* Tails Side (Back) */}
             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 border-4 border-slate-200 shadow-[0_0_50px_rgba(148,163,184,0.6)] flex items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                 <div className="w-[90%] h-[90%] rounded-full border-2 border-dashed border-slate-700/50 flex items-center justify-center">
                    <span className="text-8xl select-none">10</span>
                 </div>
                 <span className="absolute bottom-6 text-xs font-black tracking-widest text-slate-800 uppercase">РЕШКА</span>
             </div>
          </motion.div>
       </div>

       {result && !flipping && (
         <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className={`text-2xl font-black uppercase tracking-wider flex items-center gap-2 ${result === choice ? 'text-green-500' : 'text-red-500'}`}
         >
            {result === choice ? (
                <>
                    <Trophy className="text-yellow-400" /> ПОБЕДА {bet * 2}₽
                </>
            ) : 'ВЫ ПРОИГРАЛИ'}
         </motion.div>
       )}

       {/* Choice Buttons */}
       <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            onClick={() => setChoice('heads')}
            disabled={flipping}
            className={`py-6 rounded-2xl border-2 font-black uppercase transition-all relative overflow-hidden ${
                choice === 'heads' 
                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'border-white/10 hover:bg-white/5 text-slate-400'
            }`}
          >
            ОРЕЛ 🦅
            {choice === 'heads' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
          </button>
          
          <button 
            onClick={() => setChoice('tails')}
            disabled={flipping}
            className={`py-6 rounded-2xl border-2 font-black uppercase transition-all relative overflow-hidden ${
                choice === 'tails' 
                ? 'border-slate-400 bg-slate-500/20 text-slate-300 shadow-[0_0_20px_rgba(148,163,184,0.3)]' 
                : 'border-white/10 hover:bg-white/5 text-slate-400'
            }`}
          >
            РЕШКА 10
            {choice === 'tails' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-400 animate-pulse" />}
          </button>
       </div>

       {/* Bet Controls */}
       <div className="w-full bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center gap-2 mt-auto">
            <div className="flex-1 px-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Ваша Ставка</span>
                <input 
                    type="number" 
                    value={bet} 
                    onChange={(e) => setBet(Number(e.target.value))} 
                    disabled={flipping}
                    className="bg-transparent text-white font-mono font-bold text-xl outline-none w-full" 
                />
            </div>
            <Button onClick={flip} disabled={flipping || !choice} variant="gold" className="h-14 px-8 text-xl font-black">
                БРОСОК
            </Button>
       </div>
       
       <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Монетка" rules={RULES} />
    </div>
  );
};
