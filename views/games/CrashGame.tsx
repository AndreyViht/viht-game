
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rocket, HelpCircle, Plane } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GameRulesModal } from '../../components/ui/GameRulesModal';
import { GameSettings } from '../../types';

interface CrashGameProps {
  balance: number;
  onGameEnd: (game: string, bet: number, win: number, coefficient: number) => void;
  settings?: GameSettings;
}

export const CrashGame: React.FC<CrashGameProps> = ({ balance, onGameEnd, settings }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [crashed, setCrashed] = useState<boolean>(false);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([1.45, 2.30, 1.10, 8.55, 1.90]);
  const [showRules, setShowRules] = useState(false);
  
  // Canvas/Graph state
  const [graphPoints, setGraphPoints] = useState<string>("0,300"); // SVG path data
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 300 });

  const crashPointRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const RULES = [
    "Сделайте ставку перед началом раунда.",
    "Самолетик взлетает, и множитель растет.",
    "Нажмите 'ЗАБРАТЬ' до того, как самолет улетит (Краш).",
    "Чем дольше ждете, тем больше выигрыш, но выше риск.",
  ];

  const generateCrashPoint = () => {
    const winChance = settings?.win_chance ?? 0.45;
    const maxMult = settings?.max_mult ?? 1000;
    const r = Math.random();
    if (r < 0.03) return 1.00;
    const crash = 0.99 / (1 - Math.random());
    if (Math.random() > winChance && crash > 2.0) return 1.0 + Math.random(); 
    return Math.max(1.00, Math.min(crash, maxMult));
  };

  const updateGame = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const duration = timestamp - startTimeRef.current;
    
    // Growth function: Exponential
    const currentM = Math.pow(Math.E, 0.00006 * duration);
    
    if (currentM >= crashPointRef.current) {
      handleCrash(crashPointRef.current);
    } else {
      setMultiplier(currentM);
      
      // Calculate coordinates (viewBox 400x300)
      const x = Math.min((duration / 8000) * 400, 400); // 8 seconds to cross screen
      // Curve logic: Y goes up (coordinates down) as X increases
      // Simple quadratic curve for visual effect
      const y = 300 - Math.min((currentM - 1) * 100, 280); 
      
      setPlanePosition({ x, y });
      setGraphPoints(prev => `${prev} ${x},${y}`);
      
      requestRef.current = requestAnimationFrame(updateGame);
    }
  };

  const handleCrash = (finalMult: number) => {
      setMultiplier(finalMult);
      setCrashed(true);
      setIsPlaying(false);
      setHistory(prev => [finalMult, ...prev.slice(0, 9)]);
      onGameEnd('Crash', betAmount, 0, 0);
      if(navigator.vibrate) navigator.vibrate(200);
  };

  const startGame = () => {
    if (balance < betAmount) return; 
    setIsPlaying(true);
    setCrashed(false);
    setCashedOutAt(null);
    setMultiplier(1.00);
    setGraphPoints("0,300"); 
    setPlanePosition({ x: 0, y: 300 });
    crashPointRef.current = generateCrashPoint();
    startTimeRef.current = 0;
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleCashout = () => {
    if (!isPlaying || crashed || cashedOutAt) return;
    const current = multiplier;
    setCashedOutAt(current);
    const winAmount = betAmount * current;
    onGameEnd('Crash', betAmount, winAmount, current);
    if(navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  const doubleBet = () => setBetAmount(prev => prev * 2);
  const halfBet = () => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)));

  return (
    <div className="flex flex-col h-full gap-4 max-w-5xl mx-auto pb-6 px-2">
      <div className="flex justify-between items-center px-2 py-2">
        <h2 className="font-black italic text-2xl uppercase tracking-tighter text-white flex items-center gap-2 drop-shadow-lg">
           КРАШ
        </h2>
        <button onClick={() => setShowRules(true)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300">
          <HelpCircle size={18} />
        </button>
      </div>

      <div className="flex-1 bg-[#0f1012] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl min-h-[350px]">
          {/* Graph Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* History Strip */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-20">
             <span className="text-[10px] text-slate-500 font-bold uppercase">История</span>
             <div className="flex gap-2">
                {history.slice(0, 5).map((m, i) => (
                <div key={i} className={`px-2 py-1 rounded-md text-[10px] font-black font-mono border backdrop-blur-md ${m >= 2.0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-800/40 text-slate-400 border-white/5'}`}>
                    {m.toFixed(2)}x
                </div>
                ))}
            </div>
          </div>

          {/* Graph Container */}
          <div className="absolute inset-0 z-10 pointer-events-none">
             <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
                 <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor:crashed ? '#ef4444' : '#8b5cf6', stopOpacity:0.5}} />
                        <stop offset="100%" style={{stopColor:crashed ? '#ef4444' : '#8b5cf6', stopOpacity:0}} />
                    </linearGradient>
                 </defs>
                 <path d={`${graphPoints} V 300 H 0 Z`} fill="url(#grad1)" />
                 <path d={graphPoints} stroke={crashed ? '#ef4444' : '#8b5cf6'} strokeWidth="4" fill="none" vectorEffect="non-scaling-stroke" />
             </svg>
             
             {/* The Plane */}
             <motion.div
                className="absolute w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                style={{ 
                    left: `${(planePosition.x / 400) * 100}%`, 
                    top: `${(planePosition.y / 300) * 100}%`,
                    // Center the icon on the point
                    marginLeft: '-16px',
                    marginTop: '-16px',
                    // Rotate based on ascent (simplified)
                    transform: `rotate(${-20}deg)` 
                }}
             >
                 {crashed ? (
                     <div className="text-2xl animate-ping">💥</div>
                 ) : (
                     <Plane size={32} className="text-brand fill-brand/20 -rotate-12" />
                 )}
             </motion.div>
          </div>

          {/* Central Counter */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-20">
             <div className={`text-7xl md:text-9xl font-black font-mono tracking-tighter transition-all duration-75 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] ${
               crashed ? 'text-red-500 scale-110 blur-[1px]' : cashedOutAt ? 'text-green-400' : 'text-white'
             }`}>
               {multiplier.toFixed(2)}x
             </div>
             
             {crashed && (
                 <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1.5, opacity: 1 }} 
                    className="absolute text-red-600 font-black uppercase tracking-widest text-4xl border-4 border-red-600 px-4 py-2 rounded-xl rotate-[-10deg] bg-black/50"
                 >
                    ВЗРЫВ
                 </motion.div>
             )}
             
             {cashedOutAt && (
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl font-bold border border-green-500/30 backdrop-blur-md"
                 >
                    ПОБЕДА {(betAmount * cashedOutAt).toFixed(0)} ₽
                 </motion.div>
             )}
             
             {isPlaying && !cashedOutAt && !crashed && (
                 <div className="absolute bottom-10 animate-pulse text-brand font-bold text-sm tracking-widest">
                    ПОЛЕТ НА ЛУНУ...
                 </div>
             )}
          </div>
      </div>

      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
        <div className="flex items-center gap-3">
           <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl flex items-center px-4 py-3 relative focus-within:border-brand/50 transition-colors">
             <span className="text-slate-500 font-bold mr-2">₽</span>
             <input 
               type="number" 
               value={betAmount} 
               onChange={(e) => setBetAmount(Number(e.target.value))}
               disabled={isPlaying}
               className="bg-transparent text-white font-mono font-bold text-xl w-full outline-none"
             />
           </div>
           <button onClick={halfBet} disabled={isPlaying} className="h-14 w-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-slate-400">1/2</button>
           <button onClick={doubleBet} disabled={isPlaying} className="h-14 w-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-slate-400">x2</button>
        </div>

        {isPlaying && !cashedOutAt ? (
          <Button onClick={handleCashout} variant="success" className="w-full h-16 text-2xl font-black shadow-[0_0_30px_rgba(34,197,94,0.3)] border-t-4 border-green-400 active:border-t-0 active:translate-y-1 transition-all">
            ЗАБРАТЬ {(betAmount * multiplier).toFixed(0)}
          </Button>
        ) : (
          <Button onClick={startGame} disabled={isPlaying && !!cashedOutAt} variant={crashed ? "danger" : "primary"} className="w-full h-16 text-2xl font-black uppercase tracking-wider">
            {isPlaying ? "ЖДУ..." : "СТАВКА"}
          </Button>
        )}
      </div>
      
      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="Правила Краш" rules={RULES} />
    </div>
  );
};
