
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { GameSettings } from '../../types';
import { HelpCircle } from 'lucide-react';
import { GameRulesModal } from '../../components/ui/GameRulesModal';

interface Props {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

export const DiceGame: React.FC<Props> = ({ balance, onGameEnd, settings }) => {
  const [bet, setBet] = useState(10);
  const [value, setValue] = useState(50);
  const [result, setResult] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  const multiplier = (100 / (100 - value)) * 0.98;

  const RULES = [
      "Установите ползунком число от 2 до 98.",
      "Если выпавшее число будет БОЛЬШЕ вашего выбора — вы победили.",
      "Чем меньше шансов на победу, тем выше множитель выигрыша."
  ];

  const roll = () => {
     if (balance < bet) return;
     const rollResult = Math.random() * 100;
     setResult(rollResult);

     const win = rollResult > value; // Roll OVER mode
     const winAmount = win ? bet * multiplier : 0;
     
     onGameEnd('Dice', bet, winAmount, win ? multiplier : 0);
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-8">
        <div className="flex w-full justify-between items-center">
             <h2 className="text-2xl font-black italic uppercase text-blue-500 text-center">ДАЙС</h2>
             <button onClick={() => setShowRules(true)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
                <HelpCircle size={18} />
             </button>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800 relative overflow-hidden">
             <div className="text-6xl font-black font-mono text-white relative z-10">
                {result !== null ? result.toFixed(2) : "00.00"}
             </div>
             {result !== null && (
                 <div className={`mt-2 font-bold ${result > value ? 'text-green-500' : 'text-red-500'}`}>
                    {result > value ? 'ПОБЕДА' : 'ПРОИГРЫШ'}
                 </div>
             )}
        </div>

        <div className="px-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>0</span>
                <span>100</span>
            </div>
            <input 
              type="range" 
              min="2" max="98" 
              value={value} 
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase">Больше чем</div>
                    <div className="text-xl font-bold text-white">{value}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase">Коэфф.</div>
                    <div className="text-xl font-bold text-blue-400">x{multiplier.toFixed(2)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase">Шанс</div>
                    <div className="text-xl font-bold text-white">{(100 - value).toFixed(0)}%</div>
                </div>
            </div>
        </div>

        <div className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between gap-4">
            <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent text-white font-bold text-xl outline-none w-20" />
            <Button onClick={roll} variant="primary" className="flex-1">
                КРУТИТЬ
            </Button>
       </div>
       
       <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Dice" rules={RULES} />
    </div>
  );
};
