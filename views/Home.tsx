
import React, { useEffect, useState } from 'react';
import { View } from '../types';
import { Rocket, Bomb, Coins, Flame, Play, Trophy, Star, TrendingUp, Zap, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface HomeProps {
  setView: (view: View) => void;
  userId?: number;
}

// Компонент бегущей строки с выигрышами
const LiveTicker = () => {
    const [wins, setWins] = useState<any[]>([]);

    useEffect(() => {
        // Фейковые данные для старта, чтобы было красиво сразу
        const fakes = [
            { id: 1, user: 'Mellstroy', game: 'Slots', win: 500000, mult: 500 },
            { id: 2, user: 'Buster', game: 'Crash', win: 12000, mult: 2.4 },
            { id: 3, user: 'Evelone', game: 'Mines', win: 45000, mult: 5.5 },
            { id: 4, user: 'Strogo', game: 'Roulette', win: 8000, mult: 14 },
            { id: 5, user: 'Dmitry', game: 'Dice', win: 1500, mult: 2 },
        ];
        setWins(fakes);

        const channel = supabase
            .channel('public:game_history')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_history' }, (payload) => {
                const newWin = payload.new;
                if (newWin.win > 0) {
                    setWins(prev => [{
                        id: newWin.id,
                        user: `VIP Player`, 
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
        <div className="w-full overflow-hidden bg-[#0a0a0a] border-y border-white/5 py-2 mb-2 relative z-20">
            <div className="flex gap-6 animate-ticker w-max">
                {[...wins, ...wins, ...wins].map((win, idx) => (
                    <div key={`${win.id}-${idx}`} className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5 shrink-0 hover:bg-white/10 transition-colors cursor-default">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                            {win.user[0]}
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{win.game}</span>
                            <span className="text-xs text-white font-bold">{win.user}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                        <span className="text-xs text-green-400 font-mono font-black drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                            +{win.win.toLocaleString()}₽
                        </span>
                    </div>
                ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10"></div>
        </div>
    );
};

export const Home: React.FC<HomeProps> = ({ setView, userId }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter relative pb-24 overflow-x-hidden">
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero Banner */}
      <div className="px-4 mb-8 mt-2">
         <div className="relative w-full aspect-[2/1] md:aspect-[3/1] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1200')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 flex flex-col items-start gap-2 md:gap-4 max-w-[80%]">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                 className="bg-brand text-white text-[10px] md:text-xs font-black px-2 py-1 rounded uppercase tracking-wider"
               >
                  Бонус к депозиту
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                 className="text-3xl md:text-5xl font-display font-black italic uppercase leading-none"
               >
                  ЗАБЕРИ <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">25,000 ₽</span>
               </motion.h1>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Button onClick={() => setView(View.WALLET)} variant="gold" size="sm" className="mt-2 text-black border-none shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:shadow-[0_0_30px_rgba(251,191,36,0.8)]">
                     ПОЛУЧИТЬ БОНУС
                  </Button>
               </motion.div>
            </div>
         </div>
      </div>

      {/* Quick Menu */}
      <div className="px-4 mb-8">
          <div className="grid grid-cols-4 gap-2">
              {[
                  { icon: Flame, label: "Популярное", color: "text-orange-500", view: View.GAMES_LIST },
                  { icon: Rocket, label: "Crash", color: "text-indigo-500", view: View.CRASH },
                  { icon: Bomb, label: "Mines", color: "text-emerald-500", view: View.MINES },
                  { icon: Coins, label: "Slots", color: "text-pink-500", view: View.SLOTS },
              ].map((item, i) => (
                  <button key={i} onClick={() => setView(item.view)} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-brand/30 transition-all group">
                      <div className={`p-2 rounded-xl bg-black/50 group-hover:scale-110 transition-transform shadow-lg ${item.color}`}>
                          <item.icon size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{item.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* VIHT ORIGINALS */}
      <div className="px-4 mb-8">
         <div className="flex items-center gap-2 mb-4">
            <Crown size={20} className="text-brand-accent" />
            <h2 className="text-xl font-display font-black uppercase italic tracking-wide">VIHT <span className="text-brand">ORIGINALS</span></h2>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
             {/* CRASH CARD */}
             <div onClick={() => setView(View.CRASH)} className="relative h-40 bg-[#161618] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80')] bg-cover opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-60 transition-all duration-500"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                 
                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/10">
                    Live
                 </div>

                 <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Rocket size={16} className="text-indigo-400" />
                        <span className="font-display font-black text-lg uppercase italic">CRASH</span>
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                    </div>
                 </div>
             </div>

             {/* MINES CARD */}
             <div onClick={() => setView(View.MINES)} className="relative h-40 bg-[#161618] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80')] bg-cover opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-60 transition-all duration-500"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                 
                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/10">
                    RTP 99%
                 </div>

                 <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Bomb size={16} className="text-emerald-400" />
                        <span className="font-display font-black text-lg uppercase italic">MINES</span>
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                    </div>
                 </div>
             </div>
         </div>
      </div>

      {/* POPULAR SLOTS */}
      <div className="px-4">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                <h2 className="text-xl font-display font-black uppercase italic tracking-wide">HOT <span className="text-purple-500">SLOTS</span></h2>
            </div>
            <button onClick={() => setView(View.GAMES_LIST)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                ВСЕ ИГРЫ
            </button>
         </div>

         <div onClick={() => setView(View.SLOTS)} className="w-full aspect-[21/9] bg-[#1a1a1c] rounded-2xl relative overflow-hidden group cursor-pointer border border-white/5 shadow-lg">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-transparent mix-blend-multiply"></div>
             
             <div className="absolute top-1/2 -translate-y-1/2 left-6">
                <h3 className="text-3xl font-display font-black italic uppercase text-white drop-shadow-lg mb-2">
                    SWEET <br/><span className="text-pink-400">BONANZA</span>
                </h3>
                <div className="flex items-center gap-2">
                   <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_#ec4899]">JACKPOT</span>
                   <span className="text-xs font-bold text-pink-200">x21,000</span>
                </div>
             </div>

             <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-brand group-hover:scale-110 transition-all">
                <Play size={20} fill="currentColor" className="ml-1" />
             </div>
         </div>

         {/* Grid of smaller games */}
         <div className="grid grid-cols-3 gap-3 mt-4">
             <div onClick={() => setView(View.ROULETTE)} className="aspect-square bg-[#1a1a1c] rounded-xl relative overflow-hidden border border-white/5 hover:border-red-500/50 transition-colors group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80')] bg-cover opacity-60"></div>
                 <div className="absolute bottom-2 left-2 font-bold text-xs uppercase drop-shadow-md">Roulette</div>
             </div>
             <div onClick={() => setView(View.DICE)} className="aspect-square bg-[#1a1a1c] rounded-xl relative overflow-hidden border border-white/5 hover:border-blue-500/50 transition-colors group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80')] bg-cover opacity-60"></div>
                 <div className="absolute bottom-2 left-2 font-bold text-xs uppercase drop-shadow-md">Dice</div>
             </div>
             <div onClick={() => setView(View.COINFLIP)} className="aspect-square bg-[#1a1a1c] rounded-xl relative overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-colors group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80')] bg-cover opacity-60"></div>
                 <div className="absolute bottom-2 left-2 font-bold text-xs uppercase drop-shadow-md">Coinflip</div>
             </div>
         </div>
      </div>
    </div>
  );
};
