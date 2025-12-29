
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { GameSettings } from '../../types';
import { HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GameRulesModal } from '../../components/ui/GameRulesModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

const CARDS = [2,3,4,5,6,7,8,9,10,11,12,13,14]; // 11=J, 12=Q, 13=K, 14=A

export const HiLoGame: React.FC<Props> = ({ balance, onGameEnd, settings }) => {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const RULES = [
      "Начните игру, чтобы открыть первую карту.",
      "Угадайте, будет ли следующая карта ВЫШЕ (Hi) или НИЖЕ (Lo) текущей.",
      "A (Туз) — самая старшая карта, 2 — самая младшая.",
      "При угадывании выигрыш увеличивается."
  ];

  const startGame = () => {
      if (balance < bet) return;
      setIsPlaying(true);
      setGameResult(null);
      setCurrentCard(Math.floor(Math.random() * 13) + 2);
  };

  const guess = (direction: 'hi' | 'lo') => {
      const nextCard = Math.floor(Math.random() * 13) + 2;
      
      // Check win
      let win = false;
      if (direction === 'hi' && nextCard >= currentCard) win = true;
      if (direction === 'lo' && nextCard <= currentCard) win = true;
      
      setCurrentCard(nextCard);
      
      if (win) {
          const mult = 1.95; // Упрощенный множитель 50/50
          const winAmount = bet * mult;
          setLastWin(winAmount);
          setGameResult('win');
          onGameEnd('HiLo', bet, winAmount, mult); 
          setIsPlaying(false);
          if (navigator.vibrate) navigator.vibrate(100);
      } else {
          setGameResult('lose');
          onGameEnd('HiLo', bet, 0, 0); 
          setIsPlaying(false);
          if (navigator.vibrate) navigator.vibrate(200);
      }
  };

  const cardName = (val: number) => {
      if (val <= 10) return val;
      if (val === 11) return 'J';
      if (val === 12) return 'Q';
      if (val === 13) return 'K';
      if (val === 14) return 'A';
      return val;
  };

  const isRed = ['J','Q','K'].includes(String(cardName(currentCard))) || (currentCard % 2 !== 0);

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-8 items-center min-h-[80vh]">
        <div className="flex w-full justify-between items-center">
             <h2 className="text-3xl font-black italic uppercase text-orange-500 tracking-tighter">HI-LO</h2>
             <button onClick={() => setShowRules(true)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
                <HelpCircle size={24} />
             </button>
        </div>

        {/* Card Container */}
        <div className="relative w-full flex justify-center py-8">
            <AnimatePresence mode="wait">
                 {!isPlaying && gameResult ? (
                     <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
                     >
                        {gameResult === 'win' ? (
                            <div className="text-center">
                                <ThumbsUp size={64} className="text-green-500 mx-auto mb-2" />
                                <h3 className="text-3xl font-black text-green-400 uppercase">ПОБЕДА!</h3>
                                <p className="font-mono text-xl text-white">+{lastWin.toFixed(0)} ₽</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <ThumbsDown size={64} className="text-red-500 mx-auto mb-2" />
                                <h3 className="text-3xl font-black text-red-500 uppercase">Мимо...</h3>
                            </div>
                        )}
                        <Button onClick={startGame} className="mt-6" size="sm">ЕЩЕ РАЗ</Button>
                     </motion.div>
                 ) : null}
            </AnimatePresence>

            {/* The Card */}
            <motion.div 
                key={currentCard}
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-56 h-80 bg-white rounded-3xl flex items-center justify-center border-[8px] border-slate-200 shadow-2xl relative"
            >
                <div className="absolute inset-2 border-2 border-slate-100 rounded-2xl"></div>
                <span className={`text-9xl font-black ${isRed ? 'text-red-600' : 'text-black'}`}>
                    {cardName(currentCard)}
                </span>
                <div className={`absolute top-4 left-4 text-3xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
                    {cardName(currentCard)}
                </div>
                <div className={`absolute bottom-4 right-4 text-3xl font-bold ${isRed ? 'text-red-600' : 'text-black'} rotate-180`}>
                    {cardName(currentCard)}
                </div>
            </motion.div>
        </div>

        <div className="flex gap-4 w-full px-4">
            <Button 
                onClick={() => guess('hi')} 
                className="flex-1 h-20 text-xl font-black bg-orange-500 hover:bg-orange-400 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1" 
                disabled={!isPlaying}
            >
                ВЫШЕ ⬆
            </Button>
            <Button 
                onClick={() => guess('lo')} 
                className="flex-1 h-20 text-xl font-black bg-blue-500 hover:bg-blue-400 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1" 
                disabled={!isPlaying}
            >
                НИЖЕ ⬇
            </Button>
        </div>
        
        {!isPlaying && !gameResult && (
            <div className="w-full bg-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 border border-white/10 mt-auto">
                <div className="flex flex-col pl-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Ставка</span>
                    <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent text-white font-bold text-2xl outline-none w-24" />
                </div>
                <Button onClick={startGame} variant="primary" className="px-8 h-14 text-lg">
                    НАЧАТЬ
                </Button>
            </div>
        )}

        <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Hi-Lo" rules={RULES} />
    </div>
  );
};
