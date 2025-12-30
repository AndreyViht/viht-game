
import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Leader {
    id: number;
    telegram_id: number;
    first_name: string;
    balance: number;
    photo_url?: string;
}

export const Leaders = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
    
    // Подписка на изменения баланса в реальном времени (Realtime)
    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
          // Если обновился пользователь, который есть в топе, или потенциально новый лидер - обновляем
          // Для простоты просто перезапрашиваем топ при любых изменениях баланса
          fetchLeaders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaders = async () => {
      // Запрашиваем топ 20 игроков по балансу
      const { data, error } = await supabase
          .from('users')
          .select('id, telegram_id, first_name, balance, photo_url')
          .order('balance', { ascending: false })
          .limit(20);
      
      if (!error && data) {
          setLeaders(data);
      }
      setLoading(false);
  };

  // Расчет уровня на основе баланса (так как в базе может не быть поля level)
  const calculateLevel = (balance: number) => {
      if (balance < 1000) return 1;
      return Math.floor(balance / 5000) + 1;
  };

  return (
    <div className="p-4 pb-24 min-h-screen">
       <div className="flex items-center gap-3 mb-6 sticky top-0 bg-[#000000]/80 backdrop-blur-md z-20 py-2">
           <Trophy size={32} className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
           <h1 className="text-3xl font-black italic uppercase text-white">ТОП 20</h1>
           <div className="ml-auto text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
               LIVE
           </div>
       </div>

       {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
               <Loader2 size={40} className="animate-spin text-brand" />
               <span className="text-xs font-bold uppercase tracking-widest">Загружаем лидеров...</span>
           </div>
       ) : leaders.length === 0 ? (
           <div className="text-center py-20 text-slate-600 font-bold">
               Список лидеров пуст. Стань первым!
           </div>
       ) : (
           <div className="flex flex-col gap-3">
               {leaders.map((leader, idx) => {
                   const level = calculateLevel(leader.balance);
                   
                   // Стилизация топ-3
                   let rankStyle = "bg-white/5 border-white/5";
                   let icon = <span className="text-sm font-black text-slate-500">#{idx + 1}</span>;
                   let avatarBorder = "border-white/10";

                   if (idx === 0) {
                       rankStyle = "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]";
                       icon = <Crown size={24} className="text-yellow-400 fill-yellow-400/20" />;
                       avatarBorder = "border-yellow-400 ring-2 ring-yellow-400/20";
                   } else if (idx === 1) {
                       rankStyle = "bg-gradient-to-r from-slate-300/10 to-slate-400/10 border-slate-400/50";
                       icon = <Medal size={24} className="text-slate-300" />;
                       avatarBorder = "border-slate-300 ring-2 ring-slate-300/20";
                   } else if (idx === 2) {
                       rankStyle = "bg-gradient-to-r from-orange-700/10 to-orange-800/10 border-orange-700/50";
                       icon = <Medal size={24} className="text-orange-600" />;
                       avatarBorder = "border-orange-600 ring-2 ring-orange-600/20";
                   }

                   return (
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} 
                         animate={{ opacity: 1, y: 0 }} 
                         transition={{ delay: idx * 0.05 }}
                         key={leader.id} 
                         className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md relative overflow-hidden group ${rankStyle}`}
                       >
                           {/* Rank Icon */}
                           <div className="w-8 flex justify-center shrink-0">
                               {icon}
                           </div>

                           {/* Avatar */}
                           <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 relative overflow-hidden border shrink-0 ${avatarBorder}`}>
                               {leader.photo_url ? (
                                   <img src={leader.photo_url} className="w-full h-full object-cover" loading="lazy" />
                               ) : (
                                   <User size={20} />
                               )}
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0">
                               <h3 className={`font-bold truncate ${idx < 3 ? 'text-white' : 'text-slate-300'}`}>
                                   {leader.first_name}
                               </h3>
                               <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black bg-white/10 px-1.5 py-0.5 rounded text-slate-400">
                                       LVL {level}
                                   </span>
                                   {idx === 0 && (
                                       <span className="text-[10px] font-bold text-yellow-500 animate-pulse">
                                           👑 КОРОЛЬ
                                       </span>
                                   )}
                               </div>
                           </div>

                           {/* Balance */}
                           <div className="text-right shrink-0">
                               <p className="font-mono font-black text-green-400 text-lg drop-shadow-sm">
                                   {leader.balance.toLocaleString('ru-RU')} ₽
                               </p>
                           </div>
                           
                           {/* Shine Effect for Top 1 */}
                           {idx === 0 && (
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent translate-x-[-200%] group-hover:animate-[shine_1.5s_infinite]" />
                           )}
                       </motion.div>
                   );
               })}
           </div>
       )}
    </div>
  );
};
