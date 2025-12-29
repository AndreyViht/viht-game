
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { GameSettings } from '../../types';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { GameRulesModal } from '../../components/ui/GameRulesModal';

interface Props {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

export const RouletteGame: React.FC<Props> = ({ balance, onGameEnd, settings }) => {
  const [bet, setBet] = useState(10);
  const [choice, setChoice] = useState<'red' | 'black' | 'green' | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  const RULES = [
    "Выберите цвет для ставки: Красный (x2), Черный (x2) или Зеленый (x14).",
    "Колесо вращается и останавливается на случайном числе.",
    "Зеленый сектор (Зеро) — самый редкий.",
  ];

  // Генерация CSS градиента для колеса (Европейская рулетка: 0 - зеленый, остальные чередуются)
  // Упрощенная визуализация: 37 секторов. 0 - Green.
  // Порядок чисел не важен для визуала, главное чередование цветов.
  // 360 / 37 = 9.72 градуса на сектор.
  
  const spin = () => {
    if (!choice || balance < bet || spinning) return;
    setSpinning(true);
    setLastResult(null);

    // Определяем результат заранее
    const r = Math.random();
    let outcome: 'red' | 'black' | 'green';
    let targetIndex = 0; // 0-36

    if (r < 0.027) {
        outcome = 'green';
        targetIndex = 0;
    } else if (r < 0.513) {
        outcome = 'red';
        // Случайный нечетный индекс (условно красные)
        targetIndex = Math.floor(Math.random() * 18) * 2 + 1; 
    } else {
        outcome = 'black';
        // Случайный четный индекс (условно черные, кроме 0)
        targetIndex = Math.floor(Math.random() * 18) * 2 + 2; 
    }

    // Рассчитываем вращение
    // Сектор занимает ~9.73 градуса.
    // Нужно, чтобы этот сектор оказался наверху (под стрелкой).
    // Стрелка указывает на 0 градусов (верх).
    const sectorAngle = 360 / 37;
    const offset = targetIndex * sectorAngle;
    
    // Вращаем назад, чтобы нужный сектор оказался на 0
    // Добавляем 5-10 полных оборотов
    const spins = 360 * 5; 
    const finalRotation = rotation + spins + (360 - offset) + (Math.random() * 5 - 2.5); // + random noise inside sector

    setRotation(finalRotation);

    setTimeout(() => {
        setSpinning(false);
        setLastResult(targetIndex);
        
        let multiplier = 0;
        if (outcome === choice) {
            multiplier = choice === 'green' ? 14 : 2;
        }

        onGameEnd('Roulette', bet, bet * multiplier, multiplier);
        if (multiplier > 0 && navigator.vibrate) navigator.vibrate(200);
    }, 3000); // 3 seconds spin
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-6 items-center">
        <div className="flex w-full justify-between items-center">
            <h2 className="text-2xl font-black italic uppercase text-red-500">РУЛЕТКА</h2>
            <button onClick={() => setShowRules(true)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
               <HelpCircle size={18} />
            </button>
        </div>

        {/* Wheel Container */}
        <div className="relative mt-8">
            {/* Pointer */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-yellow-400 drop-shadow-lg filter">
                <ChevronDown size={40} strokeWidth={4} />
            </div>

            {/* The Wheel */}
            <div className="w-72 h-72 rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden bg-slate-900">
                <motion.div 
                   style={{ 
                       width: '100%', 
                       height: '100%',
                       background: `conic-gradient(
                           #22c55e 0deg 9.73deg, 
                           #ef4444 9.73deg 19.46deg, 
                           #1e293b 19.46deg 29.19deg,
                           #ef4444 29.19deg 38.92deg,
                           #1e293b 38.92deg 48.65deg,
                           #ef4444 48.65deg 58.38deg,
                           #1e293b 58.38deg 68.11deg,
                           #ef4444 68.11deg 77.84deg,
                           #1e293b 77.84deg 87.57deg,
                           #ef4444 87.57deg 97.30deg,
                           #1e293b 97.30deg 107.03deg,
                           #ef4444 107.03deg 116.76deg,
                           #1e293b 116.76deg 126.49deg,
                           #ef4444 126.49deg 136.22deg,
                           #1e293b 136.22deg 145.95deg,
                           #ef4444 145.95deg 155.68deg,
                           #1e293b 155.68deg 165.41deg,
                           #ef4444 165.41deg 175.14deg,
                           #1e293b 175.14deg 184.87deg,
                           #ef4444 184.87deg 194.60deg,
                           #1e293b 194.60deg 204.33deg,
                           #ef4444 204.33deg 214.06deg,
                           #1e293b 214.06deg 223.79deg,
                           #ef4444 223.79deg 233.52deg,
                           #1e293b 233.52deg 243.25deg,
                           #ef4444 243.25deg 252.98deg,
                           #1e293b 252.98deg 262.71deg,
                           #ef4444 262.71deg 272.44deg,
                           #1e293b 272.44deg 282.17deg,
                           #ef4444 282.17deg 291.90deg,
                           #1e293b 291.90deg 301.63deg,
                           #ef4444 301.63deg 311.36deg,
                           #1e293b 311.36deg 321.09deg,
                           #ef4444 321.09deg 330.82deg,
                           #1e293b 330.82deg 340.55deg,
                           #ef4444 340.55deg 350.28deg,
                           #1e293b 350.28deg 360deg
                       )`
                   }}
                   animate={{ rotate: rotation }}
                   transition={{ duration: 3, ease: "circOut" }}
                   className="rounded-full"
                >
                    {/* Inner Circle to make it look like a donut (optional, makes text readable) */}
                    <div className="absolute inset-8 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 z-10">
                        <div className="text-center">
                            {lastResult !== null ? (
                                <div className={`text-4xl font-black ${
                                    lastResult === 0 ? 'text-green-500' : 
                                    (lastResult % 2 !== 0) ? 'text-red-500' : 'text-slate-400'
                                }`}>
                                    {lastResult === 0 ? 'ZERO' : lastResult}
                                </div>
                            ) : (
                                <div className="text-slate-500 text-xs font-bold uppercase">Вращайте</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        <div className="flex w-full gap-2 mt-4">
            <button 
                onClick={() => setChoice('red')} 
                className={`flex-1 h-14 bg-red-600 rounded-xl font-black uppercase text-sm border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all ${choice === 'red' ? 'ring-2 ring-white scale-105' : 'opacity-70'}`}
            >
                x2 Красное
            </button>
            <button 
                onClick={() => setChoice('green')} 
                className={`w-16 h-14 bg-green-500 rounded-xl font-black text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center ${choice === 'green' ? 'ring-2 ring-white scale-105' : 'opacity-70'}`}
            >
                x14
            </button>
            <button 
                onClick={() => setChoice('black')} 
                className={`flex-1 h-14 bg-slate-800 rounded-xl font-black uppercase text-sm border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all ${choice === 'black' ? 'ring-2 ring-white scale-105' : 'opacity-70'}`}
            >
                x2 Черное
            </button>
        </div>

        <div className="w-full bg-white/5 backdrop-blur-md p-4 rounded-3xl flex items-center justify-between gap-4 mt-2 border border-white/10 shadow-lg">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Ставка</span>
                <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent text-white font-bold text-xl outline-none w-24" />
            </div>
            <Button onClick={spin} disabled={spinning || !choice} className="flex-1 h-12 text-lg">
                КРУТИТЬ
            </Button>
       </div>
       
       <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Рулетки" rules={RULES} />
    </div>
  );
};
