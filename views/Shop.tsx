
import React, { useState } from 'react';
import { ShoppingBag, Zap, Sparkles, Check, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ShopItem, Booster } from '../types';
import { motion } from 'framer-motion';

interface ShopProps {
  balance: number;
  onBuy: (item: ShopItem) => void;
  activeDecoration?: string;
  activeBooster?: Booster | null;
}

export const Shop: React.FC<ShopProps> = ({ balance, onBuy, activeDecoration, activeBooster }) => {
  const [tab, setTab] = useState<'decor' | 'boosters'>('decor');

  const DECORATIONS: ShopItem[] = [
    { id: 'neon', type: 'decoration', name: 'Неоновая Аура', cost: 1000, description: 'Свечение аватара', effect: 'ring-2 ring-purple-500 shadow-[0_0_15px_#a855f7]' },
    { id: 'gold', type: 'decoration', name: 'Золотая Рамка', cost: 5000, description: 'Элитный статус', effect: 'ring-4 ring-yellow-400 border-yellow-200' },
    { id: 'fire', type: 'decoration', name: 'Огненный Эффект', cost: 2500, description: 'Ты в огне!', effect: 'ring-2 ring-orange-500 shadow-[0_0_20px_#f97316] animate-pulse' },
    { id: 'ice', type: 'decoration', name: 'Ледяной Страж', cost: 3000, description: 'Хладнокровие', effect: 'ring-2 ring-cyan-400 shadow-[0_0_20px_#22d3ee]' },
    { id: 'matrix', type: 'decoration', name: 'Матрица', cost: 4500, description: 'Ты избранный', effect: 'ring-2 ring-green-500 font-mono' },
    { id: 'glitch', type: 'decoration', name: 'Глитч', cost: 6000, description: 'Системный сбой', effect: 'ring-2 ring-red-500 animate-pulse' },
    { id: 'rainbow', type: 'decoration', name: 'Радуга', cost: 8000, description: 'Все цвета удачи', effect: 'ring-4 ring-transparent bg-gradient-to-r from-red-500 via-green-500 to-blue-500 p-[2px]' },
    { id: 'ghost', type: 'decoration', name: 'Призрак', cost: 2000, description: 'Полупрозрачность', effect: 'opacity-70 grayscale ring-2 ring-white' },
    { id: 'royal', type: 'decoration', name: 'Королевский', cost: 10000, description: 'Для королей казино', effect: 'ring-4 ring-amber-500 shadow-[0_0_30px_#f59e0b]' },
    { id: 'admin', type: 'decoration', name: 'Хакер', cost: 50000, description: 'Выглядишь как админ', effect: 'ring-2 ring-red-600 shadow-[0_0_20px_#dc2626]' },
  ];

  const BOOSTERS: ShopItem[] = [
    { id: 'x2_win', type: 'booster', name: 'Множитель x2', cost: 500, description: 'Следующая победа x2' },
    { id: 'x3_win', type: 'booster', name: 'Множитель x3', cost: 1500, description: 'Следующая победа x3' },
    { id: 'insurance_50', type: 'booster', name: 'Страховка 50%', cost: 200, description: 'Вернем 50% при проигрыше' },
    { id: 'insurance_100', type: 'booster', name: 'Страховка 100%', cost: 1000, description: 'Вернем ставку при проигрыше' },
    { id: 'xp_boost', type: 'booster', name: 'XP Бустер', cost: 300, description: '+50% опыта за игру' },
    { id: 'lucky_charm', type: 'booster', name: 'Талисман Удачи', cost: 777, description: 'Слегка повышает шансы' },
    { id: 'x5_win', type: 'booster', name: 'СУПЕР x5', cost: 5000, description: 'Рискуй крупно: x5 вин' },
    { id: 'mega_insure', type: 'booster', name: 'Мега Щит', cost: 2000, description: 'Спасает от двух проигрышей' },
    { id: 'vip_day', type: 'booster', name: 'VIP на день', cost: 1000, description: 'Доступ к VIP играм' },
    { id: 'mystery', type: 'booster', name: 'Ящик Пандоры', cost: 500, description: 'Случайный эффект' },
  ];

  return (
    <div className="p-4 pb-24 min-h-screen">
       <div className="sticky top-0 bg-[#000000]/80 backdrop-blur-md z-20 py-2 mb-4 flex items-center justify-between">
           <h1 className="text-3xl font-black italic uppercase">МАГАЗИН</h1>
           <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-mono font-bold">
               {balance.toFixed(0)} ₽
           </div>
       </div>

       <div className="flex bg-white/5 p-1 rounded-xl mb-6">
           <button 
             onClick={() => setTab('decor')} 
             className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${tab === 'decor' ? 'bg-brand text-white shadow-lg' : 'text-slate-400'}`}
           >
              <Sparkles size={16} /> УКРАШЕНИЯ
           </button>
           <button 
             onClick={() => setTab('boosters')} 
             className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${tab === 'boosters' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400'}`}
           >
              <Zap size={16} /> БУСТЕРЫ
           </button>
       </div>

       <div className="grid grid-cols-2 gap-4">
           {tab === 'decor' ? DECORATIONS.map(item => (
               <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   
                   <div className={`w-16 h-16 rounded-full bg-slate-800 mb-3 flex items-center justify-center relative ${item.effect}`}>
                       <span className="text-2xl">😎</span>
                   </div>
                   
                   <h3 className="font-bold text-white text-sm">{item.name}</h3>
                   <p className="text-[10px] text-slate-500 mb-3">{item.description}</p>
                   
                   {activeDecoration === item.effect ? (
                       <div className="mt-auto bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/30 flex items-center gap-1">
                           <Check size={12} /> НАДЕТО
                       </div>
                   ) : (
                       <Button onClick={() => onBuy(item)} size="sm" variant="glass" className="w-full mt-auto text-xs" disabled={balance < item.cost}>
                           {item.cost} ₽
                       </Button>
                   )}
               </div>
           )) : BOOSTERS.map(item => (
               <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden">
                   <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3 text-yellow-400 border border-yellow-500/20">
                       <Zap size={24} />
                   </div>
                   
                   <h3 className="font-bold text-white text-sm">{item.name}</h3>
                   <p className="text-[10px] text-slate-500 mb-3">{item.description}</p>
                   
                   {activeBooster?.id === item.id ? (
                       <div className="mt-auto bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-500/30 animate-pulse">
                           АКТИВЕН
                       </div>
                   ) : (
                       <Button onClick={() => onBuy(item)} size="sm" variant="glass" className="w-full mt-auto text-xs" disabled={balance < item.cost || !!activeBooster}>
                           {item.cost} ₽
                       </Button>
                   )}
               </div>
           ))}
       </div>
    </div>
  );
};
