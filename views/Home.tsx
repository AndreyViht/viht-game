
import React, { useEffect, useState } from 'react';
import { View, GameHistoryItem } from '../types';
import { Rocket, Bomb, TrendingUp, History, User, Zap, Crown, Gift, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeProps {
  setView: (view: View) => void;
  userId?: number;
  user?: any;
  activeBooster?: any;
  setBalance?: (b: number) => void;
}

export const Home: React.FC<HomeProps> = ({ setView, userId, user, activeBooster, setBalance }) => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [stats, setStats] = useState({ won: 0, lost: 0, total_games: 0 });
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [loadingBonus, setLoadingBonus] = useState(false);

  useEffect(() => {
    if (userId) {
        fetchHistory();
        checkBonus();
    }
  }, [userId]);

  const checkBonus = () => {
      const lastClaim = localStorage.getItem(`daily_bonus_${userId}`);
      if (!lastClaim) {
          setBonusAvailable(true);
      } else {
          const now = new Date().getTime();
          const last = parseInt(lastClaim);
          // 24 часа = 86400000 мс
          if (now - last > 86400000) {
              setBonusAvailable(true);
          } else {
              setBonusAvailable(false);
          }
      }
  };

  const claimBonus = async () => {
      setLoadingBonus(true);
      const amount = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; // 1000-5000 случайная награда
      
      // Update local storage
      localStorage.setItem(`daily_bonus_${userId}`, new Date().getTime().toString());
      
      // Update Server
      if (userId && setBalance) {
          const { data } = await supabase.rpc('admin_update_balance', {
              p_telegram_id: userId,
              p_amount: amount
          });
          // Update local UI
          // Мы не знаем текущий баланс здесь точно, но можем предположить
          // Лучше передать setBalance из App
          // Для простоты, сделаем "грязный" апдейт через refetch или перезагрузку,
          // но лучше просто алерт
          alert(`Вы получили ежедневный бонус: ${amount} ₽!`);
          window.location.reload(); // Простой способ обновить баланс в App
      }
      setLoadingBonus(false);
      setBonusAvailable(false);
  };

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
        setStats({ won, lost: 0, total_games: data.length });
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

      {/* DAILY BONUS BANNER */}
      {bonusAvailable ? (
          <motion.button 
            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            onClick={claimBonus}
            disabled={loadingBonus}
            className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(236,72,153,0.4)] relative overflow-hidden"
          >
              <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white animate-bounce">
                      <Gift size={24} />
                  </div>
                  <div className="text-left">
                      <h3 className="font-bold text-white uppercase italic">Ежедневный Бонус</h3>
                      <p className="text-xs text-pink-100">Нажми, чтобы забрать награду!</p>
                  </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/20 to-transparent"></div>
          </motion.button>
      ) : (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3 opacity-70">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <Clock size={20} />
              </div>
              <div>
                  <h3 className="font-bold text-slate-300 text-sm">Бонус получен</h3>
                  <p className="text-xs text-slate-500">Заходи завтра за новым!</p>
              </div>
          </div>
      )}

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
      ) : null}

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

    </div>
  );
};
