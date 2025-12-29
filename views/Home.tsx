
import React, { useEffect, useState } from 'react';
import { View } from '../types';
import { Rocket, Bomb, Coins, Flame, Play, Trophy, Star, TrendingUp, Zap, Crown, Gamepad2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface HomeProps {
  setView: (view: View) => void;
  userId?: number;
}

// Компонент бегущей строки с выигрышами (Live Wins)
const LiveTicker = () => {
    const [wins, setWins] = useState<any[]>([]);

    useEffect(() => {
        // Фейковые данные (Анонимные игроки, чтобы не было "Мелстроев")
        const fakes = [
            { id: 1, user: 'User772', game: 'Slots', win: 15000, mult: 50 },
            { id: 2, user: 'Alex_Viht', game: 'Crash', win: 4200, mult: 2.1 },
            { id: 3, user: 'Winner_01', game: 'Mines', win: 8500, mult: 4.5 },
            { id: 4, user: 'Lucky_Guy', game: 'Roulette', win: 3600, mult: 36 },
            { id: 5, user: 'Player_One', game: 'Dice', win: 1000, mult: 1.9 },
        ];
        setWins(fakes);

        const channel = supabase
            .channel('public:game_history')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_history' }, (payload) => {
                const newWin = payload.new;
                if (newWin.win > 0) {
                    setWins(prev => [{
                        id: newWin.id,
                        user: `Игрок ${newWin.telegram_id.toString().slice(-4)}`, 
                        game: newWin.game,
                        win: newWin.win,
                        mult: newWin.coefficient
                    }, ...prev].slice(0, 10));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="w-full overflow-hidden bg-[#0a0a0a] border-b border-white/5 py-2 mb-4 relative z-20 shadow-md">
            <div className="flex gap-4 animate-ticker w-max">
                {[...wins, ...wins, ...wins].map((win, idx) => (
                    <div key={`${win.id}-${idx}`} className="flex items-center gap-2 bg-[#121214] px-3 py-1.5 rounded-full border border-white/5 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold">
                            {win.game[0]}
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{win.user}</span>
                        </div>
                        <span className="text-xs text-brand-glow font-mono font-black">
                            +{win.win.toLocaleString()} ₽
                        </span>
                    </div>
                ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
        </div>
    );
};

export const Home: React.FC<HomeProps> = ({ setView, userId }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter relative pb-24 overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full" />
      </div>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero Banner (Брендовый) */}
      <div className="px-4 mb-8">
         <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.15)] border border-white/10 group cursor-pointer bg-[#0f0f11]">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-[#0f0f11] z-0"></div>
            
            {/* Декоративные элементы */}
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=600')] bg-cover bg-center opacity-40 mix-blend-overlay mask-gradient"></div>
            
            <div className="absolute inset-0 flex flex-col justify-center px-6 z-10">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                 className="flex items-center gap-2 mb-2"
               >
                  <Crown size={16} className="text-brand-accent" />
                  <span className="text-brand-accent font-bold text-xs uppercase tracking-widest">Premium Casino</span>
               </motion.div>
               
               <motion.h1 
                 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                 className="text-3xl md:text-4xl font-display font-black italic uppercase leading-none mb-4"
               >
                  VIHT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-glow">GAME</span>
               </motion.h1>

               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Button onClick={() => setView(View.GAMES_LIST)} variant="primary" size="sm" className="w-max px-6">
                     НАЧАТЬ ИГРУ
                  </Button>
               </motion.div>
            </div>
         </div>
      </div>

      {/* Quick Access Menu */}
      <div className="px-4 mb-8">
          <div className="grid grid-cols-4 gap-3">
              {[
                  { icon: Flame, label: "Топ", color: "text-orange-500", bg: "bg-orange-500/10", view: View.GAMES_LIST },
                  { icon: Rocket, label: "Crash", color: "text-indigo-400", bg: "bg-indigo-500/10", view: View.CRASH },
                  { icon: Bomb, label: "Mines", color: "text-emerald-400", bg: "bg-emerald-500/10", view: View.MINES },
                  { icon: Coins, label: "Slots", color: "text-pink-400", bg: "bg-pink-500/10", view: View.SLOTS },
              ].map((item, i) => (
                  <button key={i} onClick={() => setView(item.view)} className="flex flex-col items-center gap-2 group">
                      <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                          <item.icon size={24} className={item.color} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-wide">{item.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Popular Games Section */}
      <div className="px-4 mb-8">
         <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-brand" />
            <h2 className="text-lg font-display font-bold uppercase tracking-wide text-white">Популярное</h2>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
             {/* CRASH LARGE CARD */}
             <div onClick={() => setView(View.CRASH)} className="col-span-2 relative h-32 bg-[#121214] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group shadow-lg">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-transparent"></div>
                 <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-indigo-600/20 blur-[50px] rounded-full"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-between px-6">
                    <div className="flex flex-col gap-1">
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold w-max border border-indigo-500/20">LIVE</span>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">CRASH</h3>
                        <p className="text-xs text-slate-400 font-medium">Успей забрать до взрыва</p>
                    </div>
                    <Rocket size={48} className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] -rotate-12 group-hover:scale-110 transition-transform duration-300" />
                 </div>
             </div>

             {/* MINES CARD */}
             <div onClick={() => setView(View.MINES)} className="relative h-32 bg-[#121214] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group shadow-lg flex flex-col justify-between p-4">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/10 blur-[30px]"></div>
                 <div className="flex justify-between items-start">
                    <Bomb size={24} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500">RTP 99%</span>
                 </div>
                 <div>
                    <h3 className="font-black italic uppercase tracking-tight text-lg">MINES</h3>
                    <p className="text-[10px] text-slate-400">Сапер на деньги</p>
                 </div>
             </div>

             {/* SLOTS CARD */}
             <div onClick={() => setView(View.SLOTS)} className="relative h-32 bg-[#121214] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group shadow-lg flex flex-col justify-between p-4">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-pink-600/10 blur-[30px]"></div>
                 <div className="flex justify-between items-start">
                    <Coins size={24} className="text-pink-500" />
                    <span className="text-[10px] font-bold text-pink-500 flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> JACKPOT
                    </span>
                 </div>
                 <div>
                    <h3 className="font-black italic uppercase tracking-tight text-lg">SLOTS</h3>
                    <p className="text-[10px] text-slate-400">Крути и выигрывай</p>
                 </div>
             </div>
         </div>
      </div>

      {/* All Games Mini Grid */}
      <div className="px-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold uppercase tracking-wide text-white">Все игры</h2>
            <button onClick={() => setView(View.GAMES_LIST)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                Смотреть все
            </button>
         </div>

         <div className="grid grid-cols-4 gap-2">
             <div onClick={() => setView(View.ROULETTE)} className="aspect-square bg-[#121214] rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                <div className="text-center">
                    <span className="text-2xl">🔴</span>
                </div>
             </div>
             <div onClick={() => setView(View.DICE)} className="aspect-square bg-[#121214] rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                <div className="text-center">
                    <span className="text-2xl">🎲</span>
                </div>
             </div>
             <div onClick={() => setView(View.COINFLIP)} className="aspect-square bg-[#121214] rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                <div className="text-center">
                    <span className="text-2xl">🦅</span>
                </div>
             </div>
             <div onClick={() => setView(View.GAMES_LIST)} className="aspect-square bg-[#121214] rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                 <span className="font-bold text-xs text-slate-500">+4</span>
             </div>
         </div>
      </div>

    </div>
  );
};
