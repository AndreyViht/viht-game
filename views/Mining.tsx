
import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Clock, ArrowUpCircle, HardDrive } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

interface MiningProps {
  balance: number;
  setBalance: (b: number) => void;
}

interface GpuCard {
    id: string;
    name: string;
    price: number;
    profitPerHour: number;
    image: string;
}

const GPU_SHOP: GpuCard[] = [
    { id: 'gtx1060', name: 'GTX 1060', price: 1000, profitPerHour: 50, image: 'https://img.icons8.com/fluency/96/video-card.png' },
    { id: 'rtx3060', name: 'RTX 3060', price: 5000, profitPerHour: 300, image: 'https://img.icons8.com/color/96/video-card.png' },
    { id: 'rtx4090', name: 'RTX 4090', price: 25000, profitPerHour: 1800, image: 'https://img.icons8.com/external-flaticons-lineal-color-flat-icons/96/external-gpu-computer-components-flaticons-lineal-color-flat-icons-2.png' },
    { id: 'mining_rig', name: 'PRO RIG', price: 100000, profitPerHour: 8000, image: 'https://img.icons8.com/color/96/server.png' },
];

export const Mining: React.FC<MiningProps> = ({ balance, setBalance }) => {
  const [myCards, setMyCards] = useState<string[]>([]);
  const [accumulated, setAccumulated] = useState(0);
  const [lastClaim, setLastClaim] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'farm' | 'shop'>('farm');

  // Load state from local storage on mount
  useEffect(() => {
      const storedCards = localStorage.getItem('viht_mining_cards');
      if (storedCards) setMyCards(JSON.parse(storedCards));

      const storedClaim = localStorage.getItem('viht_mining_last_claim');
      if (storedClaim) setLastClaim(parseInt(storedClaim));
  }, []);

  // Calculate profit loop
  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          const hoursElapsed = (now - lastClaim) / (1000 * 60 * 60);
          
          // Cap at 24 hours
          const effectiveHours = Math.min(hoursElapsed, 24);
          
          const totalProfitPerHour = calculateTotalProfit();
          setAccumulated(totalProfitPerHour * effectiveHours);
      }, 1000);

      return () => clearInterval(interval);
  }, [myCards, lastClaim]);

  const calculateTotalProfit = () => {
      let total = 0;
      myCards.forEach(cardId => {
          const card = GPU_SHOP.find(c => c.id === cardId);
          if (card) total += card.profitPerHour;
      });
      return total;
  };

  const buyCard = (card: GpuCard) => {
      if (balance >= card.price) {
          setBalance(balance - card.price);
          const newCards = [...myCards, card.id];
          setMyCards(newCards);
          localStorage.setItem('viht_mining_cards', JSON.stringify(newCards));
          if (navigator.vibrate) navigator.vibrate(50);
      }
  };

  const claimProfit = () => {
      if (accumulated <= 0) return;
      
      setBalance(balance + accumulated);
      setLastClaim(Date.now());
      setAccumulated(0);
      localStorage.setItem('viht_mining_last_claim', Date.now().toString());
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  const totalHashrate = calculateTotalProfit();
  const fillPercentage = Math.min(100, ((Date.now() - lastClaim) / (1000 * 60 * 60 * 24)) * 100);

  return (
    <div className="p-4 pb-24 min-h-screen">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#000000]/80 backdrop-blur-md z-20 py-2">
           <div className="flex items-center gap-2">
               <Cpu size={32} className="text-green-500" />
               <h1 className="text-3xl font-black italic uppercase text-white">ФЕРМА</h1>
           </div>
           <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-mono font-bold text-green-400 border border-green-500/30 flex items-center gap-2">
               <Zap size={14} fill="currentColor" /> {totalHashrate}/ч
           </div>
        </div>

        {/* Dashboard */}
        <div className="bg-[#0f1216] border border-green-900/30 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
            
            <div className="flex flex-col items-center justify-center mb-6">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Намайнено</p>
                 <div className="text-5xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                     {accumulated.toFixed(2)} ₽
                 </div>
            </div>

            {/* Storage Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-bold">
                    <span>Хранилище</span>
                    <span>{fillPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-black rounded-full overflow-hidden border border-white/10 relative">
                    <div 
                        style={{ width: `${fillPercentage}%` }} 
                        className={`h-full transition-all duration-1000 ${fillPercentage >= 100 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    {/* Stripes */}
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30"></div>
                </div>
                {fillPercentage >= 100 && (
                     <p className="text-[10px] text-red-500 font-bold text-center mt-1">ХРАНИЛИЩЕ ПОЛНОЕ! ЗАБЕРИТЕ ДЕНЬГИ.</p>
                )}
            </div>

            <Button 
                onClick={claimProfit} 
                disabled={accumulated < 1}
                variant="success" 
                className="w-full h-14 font-black text-xl shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
                СНЯТЬ КАССУ
            </Button>
        </div>

        {/* Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
           <button onClick={() => setActiveTab('farm')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'farm' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
              МОИ КАРТЫ ({myCards.length})
           </button>
           <button onClick={() => setActiveTab('shop')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'shop' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}>
              КУПИТЬ ОБОРУДОВАНИЕ
           </button>
        </div>

        {activeTab === 'farm' ? (
            <div className="grid grid-cols-2 gap-3">
                {myCards.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-slate-500">
                        <HardDrive size={48} className="mx-auto mb-2 opacity-50" />
                        <p>У вас пока нет видеокарт.</p>
                        <p className="text-xs mt-2">Купите первую карту в магазине!</p>
                    </div>
                ) : (
                    myCards.map((cardId, idx) => {
                        const card = GPU_SHOP.find(c => c.id === cardId);
                        if (!card) return null;
                        return (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                key={idx} 
                                className="bg-[#151517] rounded-xl p-3 border border-white/5 flex flex-col items-center relative overflow-hidden"
                            >
                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                <img src={card.image} className="w-16 h-16 object-contain mb-2 drop-shadow-lg" />
                                <h4 className="font-bold text-white text-sm">{card.name}</h4>
                                <p className="text-xs text-green-400 font-mono">+{card.profitPerHour}₽/ч</p>
                                {/* Spinning Fan Animation (CSS) */}
                                <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 border-2 border-white/5 rounded-full animate-spin-slow opacity-10"></div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        ) : (
            <div className="space-y-3">
                {GPU_SHOP.map(card => (
                    <div key={card.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-20 h-20 bg-black/40 rounded-xl flex items-center justify-center p-2 border border-white/5">
                            <img src={card.image} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-white">{card.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded font-mono border border-green-500/30">
                                    +{card.profitPerHour} ₽/ч
                                </span>
                            </div>
                            <Button 
                                onClick={() => buyCard(card)} 
                                disabled={balance < card.price} 
                                size="sm" 
                                className={`w-full ${balance < card.price ? 'opacity-50' : ''}`}
                            >
                                {card.price.toLocaleString()} ₽
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
