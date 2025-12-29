
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Users, Settings, Search, Plus, Save, X, History, Calculator, Key, Database, Check, BarChart3 } from 'lucide-react';
import { GameSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<GameSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchAllUsers(); 
    fetchSettings();
  }, []);

  const fetchAllUsers = async () => {
    const { data } = await supabase.rpc('get_all_users_admin', { search_term: search || null });
    setUsers(data || []);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('game_settings').select('*');
    const defaults: GameSettings[] = [
        { game_id: 'crash', win_chance: 0.45, min_mult: 1, max_mult: 100 },
        { game_id: 'mines', win_chance: 0.9, min_mult: 1, max_mult: 24 },
        { game_id: 'slots', win_chance: 0.3, min_mult: 1.5, max_mult: 50 },
        { game_id: 'coinflip', win_chance: 0.5, min_mult: 2, max_mult: 2 },
        { game_id: 'dice', win_chance: 0.5, min_mult: 1.01, max_mult: 100 },
        { game_id: 'roulette', win_chance: 0.48, min_mult: 2, max_mult: 36 },
        { game_id: 'hilo', win_chance: 0.45, min_mult: 1.2, max_mult: 12 },
        { game_id: 'keno', win_chance: 0.3, min_mult: 1, max_mult: 100 },
    ];
    if (data && data.length > 0) {
        const merged = defaults.map(def => {
            const existing = data.find(d => d.game_id === def.game_id);
            return existing || def;
        });
        setSettings(merged);
    } else {
        setSettings(defaults);
    }
  };

  const openUserModal = async (user: any) => {
      setSelectedUser(user);
      setShowHistoryModal(true);
      const { data } = await supabase
        .from('game_history')
        .select('*')
        .eq('telegram_id', user.telegram_id)
        .order('created_at', { ascending: false })
        .limit(10);
      setUserHistory(data || []);
  };

  const addBalance = async () => {
      if (!selectedUser || !manualAmount) return;
      const amount = Number(manualAmount);
      await supabase.rpc('admin_update_balance', {
          p_telegram_id: selectedUser.telegram_id,
          p_amount: amount
      });
      const updatedUser = { ...selectedUser, balance: Number(selectedUser.balance) + amount };
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.telegram_id === updatedUser.telegram_id ? updatedUser : u));
      setManualAmount('');
      alert(`Баланс обновлен!`);
  };

  const applyPreset = (difficulty: 'easy' | 'medium' | 'hard') => {
      const multipliers = {
          easy: { win: 1.2, max: 0.8 }, // Win chance higher, max mult lower
          medium: { win: 1.0, max: 1.0 }, // Normal
          hard: { win: 0.6, max: 2.0 }   // Win chance lower, max mult higher
      };
      
      const factor = multipliers[difficulty];

      const newSettings = settings.map(s => {
          let baseChance = 0.45; // default fallback
          if (s.game_id === 'mines') baseChance = 0.9;
          if (s.game_id === 'slots') baseChance = 0.3;
          if (s.game_id === 'crash') baseChance = 0.45;
          
          let newWinChance = baseChance * factor.win;
          // Clamp between 0.05 and 0.95
          newWinChance = Math.max(0.05, Math.min(0.95, newWinChance));

          return {
              ...s,
              win_chance: Number(newWinChance.toFixed(2)),
              // For Mines/Crash, max_mult might mean something different, but we adjust generally
              max_mult: Math.floor(s.max_mult * factor.max) || s.max_mult
          };
      });
      
      setSettings(newSettings);
  };

  const saveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    for (const s of settings) await supabase.from('game_settings').upsert(s);
    setLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-4 pb-32 max-w-6xl mx-auto min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand to-pink-500">
            АДМИН ПАНЕЛЬ
         </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 sticky top-0 z-30 shadow-2xl">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-brand text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Users size={18} /> Игроки
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-brand text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Settings size={18} /> Настройки
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
           {/* Search */}
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по имени или ID..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-brand/50 outline-none backdrop-blur-md"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                  <div key={user.id} onClick={() => openUserModal(user)} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-brand/30 hover:bg-white/10 cursor-pointer transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-400 border border-white/5 overflow-hidden">
                             {user.photo_url ? <img src={user.photo_url} className="w-full h-full object-cover"/> : user.first_name?.[0]}
                          </div>
                          <div className="min-w-0">
                              <p className="font-bold text-white truncate">{user.first_name}</p>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <Database size={10} className="text-brand" /> ID: {user.id}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <Key size={10} className="text-yellow-500" /> Key: {user.telegram_id}
                                </p>
                              </div>
                          </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Баланс</p>
                          <p className="font-mono font-bold text-green-400 text-lg">{Number(user.balance).toFixed(0)} ₽</p>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
         <div className="animate-in fade-in slide-in-from-bottom-4 relative">
            
            {/* Presets Panel */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <BarChart3 size={16} /> Быстрая настройка сложности
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => applyPreset('easy')} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 py-3 rounded-xl font-bold text-sm transition-all">
                        ИЗИ (Много побед)
                    </button>
                    <button onClick={() => applyPreset('medium')} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 py-3 rounded-xl font-bold text-sm transition-all">
                        НОРМ (Баланс)
                    </button>
                    <button onClick={() => applyPreset('hard')} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-3 rounded-xl font-bold text-sm transition-all">
                        ХАРД (Мало побед)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.map((game, idx) => (
                <div key={game.game_id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-brand/30 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 blur-[40px] rounded-full group-hover:bg-brand/20 transition-colors"></div>
                    
                    <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
                        <span className="text-brand">#</span> {game.game_id}
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                        <div>
                            <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Шанс победы (0-1)</label>
                            <span className="text-xs font-mono text-brand">{game.win_chance}</span>
                            </div>
                            <input 
                            type="range" min="0" max="1" step="0.01"
                            value={game.win_chance}
                            onChange={(e) => {
                                const newSettings = [...settings];
                                newSettings[idx].win_chance = parseFloat(e.target.value);
                                setSettings(newSettings);
                            }}
                            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Макс. Множитель</label>
                            <input 
                            type="number"
                            value={game.max_mult}
                            onChange={(e) => {
                                const newSettings = [...settings];
                                newSettings[idx].max_mult = parseFloat(e.target.value);
                                setSettings(newSettings);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono focus:border-brand/50 outline-none"
                            />
                        </div>
                    </div>
                </div>
                ))}
            </div>
            
            {/* Sticky Save Button - Fixed Visibility */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#000000] border-t border-white/10 z-[100] flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                <Button 
                   onClick={saveSettings} 
                   disabled={loading} 
                   variant={saveSuccess ? "success" : "primary"}
                   className="w-full max-w-md py-4 text-xl shadow-[0_0_50px_rgba(139,92,246,0.5)] transform active:scale-95 transition-all"
                >
                   {loading ? (
                      <span className="flex items-center gap-2">СОХРАНЯЕМ...</span>
                   ) : saveSuccess ? (
                      <span className="flex items-center gap-2"><Check /> СОХРАНЕНО!</span>
                   ) : (
                      'ПРИМЕНИТЬ ИЗМЕНЕНИЯ'
                   )}
                </Button>
            </div>
         </div>
      )}

      {/* USER DETAIL MODAL */}
      <AnimatePresence>
        {showHistoryModal && selectedUser && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowHistoryModal(false)}
           >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0f1012] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              >
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden">
                          {selectedUser.photo_url && <img src={selectedUser.photo_url} className="w-full h-full object-cover" />}
                       </div>
                       <div>
                          <h2 className="text-xl font-bold text-white">{selectedUser.first_name}</h2>
                          <div className="flex gap-2 mt-1">
                               <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300">ID: {selectedUser.id}</span>
                               <span className="text-[10px] bg-brand/20 px-1.5 py-0.5 rounded font-mono text-brand">Key: {selectedUser.telegram_id}</span>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setShowHistoryModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                       <X size={18} />
                    </button>
                 </div>

                 <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {/* Manual Balance */}
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Calculator size={14} /> Выдать Баланс
                            </label>
                            <span className="text-sm font-mono font-bold text-green-400">
                                Текущий: {Number(selectedUser.balance).toFixed(2)} ₽
                            </span>
                        </div>
                        <div className="flex gap-2">
                           <input 
                             type="number" 
                             placeholder="Сумма (+/-)" 
                             value={manualAmount}
                             onChange={(e) => setManualAmount(e.target.value)}
                             className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-white font-mono outline-none focus:border-brand"
                           />
                           <Button onClick={addBalance} size="sm" variant="glass">ПРИМЕНИТЬ</Button>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                       <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                          <History size={16} /> Последние 10 игр
                       </h3>
                       <div className="space-y-2">
                          {userHistory.map(game => (
                             <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
                                <div className="flex items-center gap-3">
                                   <span className={`w-2 h-2 rounded-full ${game.win > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                   <span className="font-bold">{game.game}</span>
                                </div>
                                <div className="text-right">
                                   <div className={`font-mono font-bold ${game.win > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                                      {game.win > 0 ? `+${game.win}` : `-${game.bet}`}
                                   </div>
                                   <div className="text-[10px] text-slate-600">x{game.coefficient}</div>
                                </div>
                             </div>
                          ))}
                          {userHistory.length === 0 && <p className="text-slate-600 text-center py-4">История игр пуста.</p>}
                       </div>
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
