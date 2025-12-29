
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { HelpCircle, Info, Trophy, Zap } from 'lucide-react';
import { GameRulesModal } from '../../components/ui/GameRulesModal';
import { GameSettings } from '../../types';

interface SlotsGameProps {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

// Конфигурация символов
const SYMBOLS = [
  { id: 'wild', char: '⚡', color: 'text-yellow-400', multiplier: 0, type: 'wild' }, // Wild (заменяет любой)
  { id: 'seven', char: '7️⃣', color: 'text-red-500', multiplier: 50, type: 'standard' },
  { id: 'diamond', char: '💎', color: 'text-cyan-400', multiplier: 25, type: 'standard' },
  { id: 'bell', char: '🔔', color: 'text-amber-300', multiplier: 15, type: 'standard' },
  { id: 'clover', char: '🍀', color: 'text-green-500', multiplier: 10, type: 'standard' },
  { id: 'grape', char: '🍇', color: 'text-purple-400', multiplier: 5, type: 'standard' },
  { id: 'lemon', char: '🍋', color: 'text-yellow-200', multiplier: 3, type: 'standard' },
  { id: 'cherry', char: '🍒', color: 'text-red-400', multiplier: 2, type: 'standard' },
];

// Для генерации ленты (чтобы крутилось)
const REEL_STRIP = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS]; 
const REEL_HEIGHT = 96; // Высота одной ячейки (h-24 = 6rem = 96px)

export const SlotsGame: React.FC<SlotsGameProps> = ({ balance, onGameEnd, settings }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelOffsets, setReelOffsets] = useState([0, 0, 0]); // Смещение ленты для анимации
  const [finalSymbols, setFinalSymbols] = useState([SYMBOLS[6], SYMBOLS[6], SYMBOLS[6]]); // То, что выпало
  const [winData, setWinData] = useState<{ amount: number; multiplier: number; isWin: boolean } | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Правила
  const RULES = [
    "Цель: Собрать линию из 3 одинаковых символов.",
    "⚡ (Wild) заменяет любой другой символ.",
    "3 x ⚡ = Джекпот (x100).",
    "3 x 7️⃣ = x50.",
    "3 x 🍒 = x2.",
    "Выигрыш считается только по центральной линии."
  ];

  // Генерация случайного символа с учетом весов (упрощенно: чем ниже в списке, тем чаще)
  const getRandomSymbol = () => {
    // Шансы (условно): Wild редкий, Вишни частые
    const rand = Math.random();
    if (rand < 0.02) return SYMBOLS[0]; // Wild 2%
    if (rand < 0.06) return SYMBOLS[1]; // 777 4%
    if (rand < 0.12) return SYMBOLS[2]; // Diamond 6%
    if (rand < 0.20) return SYMBOLS[3]; // Bell 8%
    if (rand < 0.35) return SYMBOLS[4]; // Clover 15%
    if (rand < 0.55) return SYMBOLS[5]; // Grape 20%
    if (rand < 0.75) return SYMBOLS[6]; // Lemon 20%
    return SYMBOLS[7]; // Cherry 25%
  };

  const spin = () => {
    if (balance < betAmount || isSpinning) return;
    
    setIsSpinning(true);
    setWinData(null);
    if(navigator.vibrate) navigator.vibrate(50);

    // 1. Определяем результат ЗАРАНЕЕ (Server-side logic simulation)
    const winChance = settings?.win_chance ?? 0.35;
    const isWinRound = Math.random() < winChance;
    
    let result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Подкрутка результата если это должен быть выигрыш (или проигрыш)
    if (isWinRound) {
       // Генерируем выигрышную комбинацию
       const base = getRandomSymbol();
       // 20% шанс на Wild в комбинации
       const s1 = Math.random() < 0.2 ? SYMBOLS[0] : base;
       const s2 = Math.random() < 0.2 ? SYMBOLS[0] : base;
       const s3 = Math.random() < 0.2 ? SYMBOLS[0] : base;
       result = [s1, s2, s3];
       // Защита от 3 Wild (очень редко)
       if (result[0].id === 'wild' && result[1].id === 'wild' && result[2].id === 'wild') {
           if (Math.random() > 0.05) result = [SYMBOLS[1], SYMBOLS[1], SYMBOLS[1]]; // Сменим на семерки
       }
    } else {
       // Гарантируем проигрыш (если вдруг случайно выпало 3 одинаковых)
       if (checkIsWin(result)) {
          // Меняем последний символ
          while (result[2].id === result[0].id || result[2].id === 'wild') {
             result[2] = getRandomSymbol();
          }
       }
    }

    setFinalSymbols(result);

    // 2. Запускаем анимацию барабанов
    // Мы просто увеличиваем offset на большое число + индекс символа
    // Для простоты реализации на React без Canvas, мы будем эмулировать вращение CSS классом blur
    
    const delay = 300; // задержка между остановкой барабанов
    const spinDuration = 1500;

    // Таймеры остановки
    setTimeout(() => stopReel(0), spinDuration);
    setTimeout(() => stopReel(1), spinDuration + delay);
    setTimeout(() => stopReel(2), spinDuration + delay * 2);

    // Финал
    setTimeout(() => {
       calculateWin(result);
       setIsSpinning(false);
    }, spinDuration + delay * 2 + 300);
  };

  const stopReel = (index: number) => {
      if(navigator.vibrate) navigator.vibrate(20);
      // Звуковой эффект "стук" можно добавить здесь
  };

  const checkIsWin = (symbols: typeof SYMBOLS) => {
      const [s1, s2, s3] = symbols;
      // Логика Wild: Wild совпадает со всем
      // Пример: 7 + Wild + 7 = WIN (как 3 семерки)
      // Пример: Cherry + Cherry + Wild = WIN (как 3 вишни)
      // Пример: Wild + Lemon + Wild = WIN (как 3 лимона)
      
      // Находим "базовый" символ (не Wild)
      const base = symbols.find(s => s.id !== 'wild');
      
      if (!base) return true; // Все Wild -> Jackpot
      
      // Проверяем, совпадают ли все символы с базовым (учитывая, что Wild подходит ко всему)
      const match1 = s1.id === 'wild' || s1.id === base.id;
      const match2 = s2.id === 'wild' || s2.id === base.id;
      const match3 = s3.id === 'wild' || s3.id === base.id;
      
      return match1 && match2 && match3;
  };

  const calculateWin = (symbols: typeof SYMBOLS) => {
      if (checkIsWin(symbols)) {
          // Определяем множитель
          const base = symbols.find(s => s.id !== 'wild');
          let mult = 0;
          if (!base) mult = 100; // 3 Wilds
          else mult = base.multiplier;
          
          const win = betAmount * mult;
          setWinData({ amount: win, multiplier: mult, isWin: true });
          onGameEnd('Slots', betAmount, win, mult);
          if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
      } else {
          onGameEnd('Slots', betAmount, 0, 0);
      }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2 max-w-lg mx-auto h-full">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-2">
        <h2 className="font-black italic text-3xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 drop-shadow-sm">
           NEON SLOTS
        </h2>
        <div className="flex gap-2">
            <button onClick={() => setShowRules(true)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
            <HelpCircle size={20} />
            </button>
        </div>
      </div>

      {/* SLOT MACHINE CONTAINER */}
      <div className="relative w-full mt-4">
        {/* Декор сверху (лампочки) */}
        <div className="absolute -top-3 left-0 right-0 flex justify-center gap-4 z-20">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isSpinning ? 'text-yellow-400 animate-pulse' : 'text-red-900 bg-red-900'}`}></div>
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isSpinning ? 'text-blue-400 animate-bounce' : 'text-blue-900 bg-blue-900'}`}></div>
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isSpinning ? 'text-green-400 animate-pulse' : 'text-green-900 bg-green-900'}`}></div>
        </div>

        {/* Main Frame */}
        <div className="bg-gradient-to-b from-slate-900 to-black p-4 rounded-[2rem] border-4 border-slate-800 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-20 rounded-[1.8rem]"></div>
            
            {/* Payline Marker */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-24 bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-yellow-500/30 z-10 pointer-events-none flex items-center justify-between px-2">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-yellow-500 border-b-[8px] border-b-transparent"></div>
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-yellow-500 border-b-[8px] border-b-transparent"></div>
            </div>

            {/* Reels Container */}
            <div className="grid grid-cols-3 gap-2 bg-black rounded-xl p-2 relative">
                {[0, 1, 2].map((colIndex) => (
                    <div key={colIndex} className="relative h-24 overflow-hidden bg-[#151517] rounded-lg border border-white/5 shadow-inner">
                        {/* Reel Strip */}
                        <motion.div
                             className="flex flex-col items-center"
                             initial={{ y: 0 }}
                             animate={isSpinning ? {
                                 y: [0, -1000],
                                 filter: "blur(4px)",
                                 transition: { repeat: Infinity, duration: 0.2, ease: "linear" }
                             } : {
                                 y: 0,
                                 filter: "blur(0px)",
                                 transition: { type: "spring", stiffness: 300, damping: 20 }
                             }}
                        >
                            {isSpinning ? (
                                // While spinning, show repeating strip
                                Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="h-24 flex items-center justify-center text-5xl">
                                        {SYMBOLS[i % SYMBOLS.length].char}
                                    </div>
                                ))
                            ) : (
                                // Static Result
                                <div className="h-24 flex items-center justify-center text-5xl scale-110 drop-shadow-lg">
                                    {finalSymbols[colIndex].char}
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Shadow Gradient for depth */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none z-10"></div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Base of machine */}
        <div className="h-4 mx-8 bg-slate-800 rounded-b-xl opacity-50"></div>
      </div>

      {/* Win Display */}
      <div className="h-20 flex items-center justify-center w-full relative">
         <AnimatePresence mode="wait">
            {winData?.isWin ? (
                 <motion.div 
                    initial={{ scale: 0, rotate: -10 }} 
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                 >
                    <div className="text-yellow-400 font-black text-5xl drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                        +{winData.amount}₽
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/50 uppercase tracking-widest">
                        БОЛЬШОЙ КУШ x{winData.multiplier}
                    </div>
                 </motion.div>
            ) : isSpinning ? (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-slate-500 font-mono text-sm tracking-widest uppercase animate-pulse"
                 >
                    УДАЧИ...
                 </motion.div>
            ) : (
                <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {SYMBOLS.slice(0, 4).map(s => (
                        <div key={s.id} className="flex flex-col items-center gap-1">
                            <span className="text-xl">{s.char}</span>
                            <span className="text-[10px] font-bold text-slate-400">x{s.multiplier}</span>
                        </div>
                    ))}
                </div>
            )}
         </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 w-full mt-auto mb-4 shadow-xl">
         <div className="flex items-center justify-between mb-4 bg-black/40 p-2 rounded-2xl border border-white/5">
            <button 
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))} 
                disabled={isSpinning}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-2xl text-slate-300 disabled:opacity-30 active:scale-95 transition-all"
            >-</button>
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ставка</span>
               <span className="font-mono font-bold text-xl text-white">{betAmount} ₽</span>
            </div>
            <button 
                onClick={() => setBetAmount(betAmount + 10)} 
                disabled={isSpinning}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-2xl text-slate-300 disabled:opacity-30 active:scale-95 transition-all"
            >+</button>
         </div>

         <div className="grid grid-cols-4 gap-2 mb-4">
             {[50, 100, 500, 1000].map(amt => (
                 <button 
                    key={amt} 
                    onClick={() => setBetAmount(amt)}
                    disabled={isSpinning}
                    className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 border border-white/5 transition-colors"
                 >
                    {amt}
                 </button>
             ))}
         </div>

         <Button 
            onClick={spin} 
            disabled={isSpinning} 
            className={`w-full h-16 text-2xl font-black uppercase tracking-widest shadow-lg transition-all ${isSpinning ? 'opacity-80' : 'hover:scale-[1.02]'}`}
            variant="glass"
            style={{
                background: isSpinning 
                  ? 'linear-gradient(45deg, #374151, #1f2937)' 
                  : 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                borderColor: 'rgba(255,255,255,0.2)'
            }}
         >
           {isSpinning ? (
               <div className="flex items-center gap-2">
                   <span className="animate-spin text-3xl">❄</span> 
                   <span>КРУТИМ...</span>
               </div>
           ) : (
               <div className="flex items-center gap-2">
                   <Zap className="fill-white" /> КРУТИТЬ
               </div>
           )}
         </Button>
      </div>
      
      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Слоты" rules={RULES} />
    </div>
  );
};
