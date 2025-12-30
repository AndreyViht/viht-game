
import React, { useEffect, useState } from 'react';
import { View, GameHistoryItem } from '../types';
import { Rocket, Bomb, Coins, TrendingUp, History, Trophy, Sparkles, User, Zap, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface HomeProps {
  setView: (view: View) => void;
  userId?: number;
  user?: any;
  activeBooster?: any;
}

export const Home: React.FC<HomeProps> = ({ setView, userId, user, activeBooster }) => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [stats, setStats] = useState({ won: 0, lost: 0, total_games: 0 });

  useEffect(() => {
    if (userId) {
        fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    // Fetch last 5 games for this user
    const { data } = await supabase
        .from('game_history')
        .select('*')
        .eq('telegram_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (data) {
        setHistory(data);
        // Calculate basic stats from these 5 (or fetch real agg stats)
        const won = data.filter(g => g.win > 0).reduce((acc, curr) => acc + curr.win, 0);
        const lost = data.filter(g => g.win === 0).reduce((acc, curr) => acc + curr.bet, 0);
        setStats({ won, lost, total_games: data.length });
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      
      {/* 1. Profile Card (Glass) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                  {user?.photo_url ? (
                      <img src={user.photo_url} className="w-full h-full object-cover" />
                  ) : (
                      <User size={32} className="text-slate-400" />
                  )}
              </div>
              <div>
                  <h2 className="text-xl font-bold text-white">{user?.first_name || 'Игрок'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                          <Crown size={10} /> VIP 1
                      </span>
                      <span className="text-xs text-slate-400">ID: {userId?.toString().slice(-4)}</span>
                  </div>
              </div>
          </div>

          <div className="mt-6 flex gap-4">
              <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Всего Выиграно</span>
                  <span className="text-lg font-mono font-bold text-green-400">+{stats.won.toLocaleString()} ₽</span>
              </div>
              <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Всего Игр</span>
                  <span className="text-lg font-mono font-bold text-white">{stats.total_games}</span>
              </div>
          </div>
      </div>

      {/* 2. Active Booster Widget */}
      {activeBooster ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          >
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black shadow-lg">
                    <Zap size={20} fill="currentColor" />
                 </div>
                 <div>
                     <h3 className="font-bold text-white text-sm">Активный Бустер</h3>
                     <p className="text-xs text-yellow-200">{activeBooster.label}</p>
                 </div>
             </div>
             <div className="text-xs font-bold bg-black/40 px-3 py-1 rounded-lg text-white">
                 1 ИГРА
             </div>
          </motion.div>
      ) : (
          <div onClick={() => setView(View.SHOP)} className="border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-500 hover:bg-white/5 cursor-pointer transition-colors">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase">Нет активных улучшений (Купить)</span>
          </div>
      )}

      {/* 3. Game History */}
      <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 px-1">
              <History size={16} /> Последние игры
          </h3>
          <div className="flex flex-col gap-2">
              {history.length > 0 ? history.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between backdrop-blur-md">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                             item.game === 'Crash' ? 'bg-indigo-500/20 text-indigo-400' :
                             item.game === 'Mines' ? 'bg-emerald-500/20 text-emerald-400' :
                             'bg-pink-500/20 text-pink-400'
                          }`}>
                              {item.game[0]}
                          </div>
                          <div>
                              <p className="font-bold text-white text-sm">{item.game}</p>
                              <p className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleTimeString()}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className={`font-mono font-bold text-sm ${item.win > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                              {item.win > 0 ? `+${item.win.toFixed(0)} ₽` : `-${item.bet.toFixed(0)} ₽`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold">x{item.coefficient.toFixed(2)}</p>
                      </div>
                  </div>
              )) : (
                  <div className="text-center py-8 text-slate-600 text-xs">Нет истории игр</div>
              )}
          </div>
      </div>

      {/* 4. Popular Games */}
      <div>
          <div className="flex items-center justify-between mb-3 px-1">
             <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                <TrendingUp size={16} /> Популярное
             </h3>
             <button onClick={() => setView(View.GAMES_LIST)} className="text-[10px] text-brand hover:text-white transition-colors">
                ВСЕ ИГРЫ
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div onClick={() => setView(View.CRASH)} className="bg-[#151517] rounded-2xl p-4 relative overflow-hidden group border border-white/5 cursor-pointer">
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-20 group-hover:opacity-40 transition-opacity">
                     <Rocket size={60} className="text-indigo-500" />
                 </div>
                 <h4 className="font-black italic text-lg uppercase z-10 relative">Crash</h4>
                 <p className="text-[10px] text-slate-500 z-10 relative">Популярность: 🔥🔥🔥</p>
             </div>
             
             <div onClick={() => setView(View.MINES)} className="bg-[#151517] rounded-2xl p-4 relative overflow-hidden group border border-white/5 cursor-pointer">
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-20 group-hover:opacity-40 transition-opacity">
                     <Bomb size={60} className="text-emerald-500" />
                 </div>
                 <h4 className="font-black italic text-lg uppercase z-10 relative">Mines</h4>
                 <p className="text-[10px] text-slate-500 z-10 relative">Выбор игроков</p>
             </div>
          </div>
      </div>

    </div>
  );
};
