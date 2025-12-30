
import React, { useState } from 'react';
import { ShieldCheck, Wallet as WalletIcon, AlertTriangle, Crown, Star, Lock, Info, ExternalLink, Send, Ticket, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface WalletProps {
    userId?: number;
    balance: number;
    setBalance: (b: number) => void;
}

export const Wallet: React.FC<WalletProps> = ({ userId, balance, setBalance }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'levels' | 'transfer' | 'promo'>('balance');
  
  // Transfer state
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Fake stats for levels (in a real app, pass this via props)
  const currentLevel = 2;
  const xp = 6500;
  const nextLevelXp = 10000;
  const progress = (xp / nextLevelXp) * 100;

  const levels = [
      { lvl: 1, name: "Новичок", req: 0, reward: "Доступ к играм" },
      { lvl: 2, name: "Игрок", req: 5000, reward: "Бонус x1.1 к депозиту" },
      { lvl: 3, name: "Опытный", req: 25000, reward: "Уникальная аватарка" },
      { lvl: 4, name: "VIP", req: 100000, reward: "Персональный менеджер" },
      { lvl: 5, name: "ЛЕГЕНДА", req: 1000000, reward: "Секретные игры" },
  ];

  const handleTransfer = async () => {
      if (!userId || !receiverId || !amount) return;
      const amountNum = Number(amount);
      if (amountNum <= 0 || amountNum > balance) {
          alert('Некорректная сумма');
          return;
      }

      setTransferLoading(true);

      // В реальном проекте тут нужен RPC вызов 'transfer_funds'
      // Имитируем снятие средств локально и обновление
      const { error } = await supabase.rpc('transfer_balance', {
          sender_tg_id: userId,
          receiver_tg_id: Number(receiverId), // User enters Telegram ID or Internal ID
          amount: amountNum
      });

      if (error) {
          alert('Ошибка перевода! Проверьте ID получателя.');
      } else {
          alert('Перевод успешно отправлен!');
          setBalance(balance - amountNum);
          setAmount('');
          setReceiverId('');
      }
      setTransferLoading(false);
  };

  const handlePromo = async () => {
      if (!promoCode) return;
      setPromoLoading(true);

      // Простая заглушка для промокодов
      if (promoCode.toUpperCase() === 'VIHT2024') {
          const reward = 5000;
          await supabase.rpc('admin_update_balance', { p_telegram_id: userId, p_amount: reward });
          alert(`Промокод активирован! +${reward} ₽`);
          setBalance(balance + reward);
          // В реальном проекте нужно сохранять использование промокода в БД
      } else {
          alert('Неверный промокод или он уже использован.');
      }
      setPromoLoading(false);
      setPromoCode('');
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 min-h-screen flex flex-col relative pb-24">
      <div className="absolute top-6 right-4">
         <a href="https://t.me/anviht" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ExternalLink size={16} />
         </a>
      </div>

      <h1 className="text-3xl font-black italic uppercase text-center mb-6">Кошелек</h1>

      {/* Scrollable Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-8 overflow-x-auto no-scrollbar gap-1">
          <button onClick={() => setActiveTab('balance')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'balance' ? 'bg-brand text-white shadow-lg' : 'text-slate-400'}`}>
             <WalletIcon size={14} /> БАЛАНС
          </button>
          <button onClick={() => setActiveTab('transfer')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'transfer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
             <Send size={14} /> ПЕРЕВОД
          </button>
          <button onClick={() => setActiveTab('promo')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'promo' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400'}`}>
             <Ticket size={14} /> ПРОМО
          </button>
          <button onClick={() => setActiveTab('levels')} className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'levels' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400'}`}>
             <Crown size={14} /> VIP
          </button>
      </div>

      {activeTab === 'balance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl text-center">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand/20 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] mb-4">
                      <WalletIcon className="text-white" size={40} />
                  </div>

                  <h2 className="text-xl font-bold mb-2">Ваш Баланс</h2>
                  <div className="text-4xl font-black font-mono text-white mb-4 tracking-tighter">
                      {balance.toLocaleString()} ₽
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                          <Info className="text-blue-400" size={20} />
                          <h3 className="font-bold text-white">Вывод средств</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                          Средства с этого баланса <strong>не подлежат выводу</strong> в реальные деньги. Это очки опыта и статуса.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'transfer' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-blue-900/10 border border-blue-500/20 rounded-3xl p-6">
                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                       <Send size={24} className="text-blue-500" /> Перевод другу
                   </h2>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">ID Получателя (Telegram ID)</label>
                           <input 
                              type="number" 
                              placeholder="Например: 1464327605"
                              value={receiverId}
                              onChange={(e) => setReceiverId(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none"
                           />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Сумма</label>
                           <input 
                              type="number" 
                              placeholder="Минимум 100"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none"
                           />
                       </div>
                       
                       <Button 
                          onClick={handleTransfer} 
                          disabled={transferLoading}
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                       >
                           {transferLoading ? "Отправка..." : "ОТПРАВИТЬ"}
                       </Button>
                   </div>
               </div>
               
               <p className="text-xs text-center text-slate-500">
                   Комиссия за перевод: 0%. Переводы необратимы.
               </p>
          </div>
      )}

      {activeTab === 'promo' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-pink-900/10 border border-pink-500/20 rounded-3xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] pointer-events-none"></div>
                   
                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                       <Ticket size={24} className="text-pink-500" /> Активация кода
                   </h2>
                   
                   <div className="flex gap-2">
                       <input 
                          type="text" 
                          placeholder="Введи промокод"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono uppercase focus:border-pink-500 outline-none"
                       />
                       <button 
                          onClick={handlePromo}
                          disabled={promoLoading}
                          className="bg-pink-600 hover:bg-pink-500 text-white rounded-xl px-4 flex items-center justify-center"
                       >
                           <ArrowRight size={24} />
                       </button>
                   </div>
                   
                   <div className="mt-6 flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                       <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                       <p className="text-xs text-slate-400">
                           Ищи промокоды в нашем Telegram канале. Они дают бонус к балансу, бесплатные вращения или уникальные украшения.
                       </p>
                   </div>
               </div>
          </div>
      )}

      {activeTab === 'levels' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Current Status Card */}
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-900 rounded-3xl p-6 border border-yellow-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                      <Crown size={100} className="text-black" />
                  </div>
                  
                  <div className="relative z-10">
                      <p className="text-yellow-200 font-bold text-xs uppercase tracking-widest mb-1">Ваш текущий статус</p>
                      <h2 className="text-3xl font-black text-white italic uppercase mb-4">{levels[currentLevel - 1].name}</h2>
                      
                      <div className="flex justify-between text-xs font-bold text-yellow-100 mb-2">
                          <span>Опыт: {xp}</span>
                          <span>След. уровень: {nextLevelXp}</span>
                      </div>
                      <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                          <div style={{ width: `${progress}%` }} className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                      </div>
                  </div>
              </div>

              {/* Levels List */}
              <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-400 uppercase ml-2">Таблица Привилегий</h3>
                  {levels.map((lvl) => {
                      const isUnlocked = currentLevel >= lvl.lvl;
                      const isCurrent = currentLevel === lvl.lvl;
                      
                      return (
                        <div key={lvl.lvl} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                            isCurrent ? 'bg-white/10 border-yellow-500/50 shadow-lg' : 
                            isUnlocked ? 'bg-white/5 border-white/10' : 'opacity-50 bg-black/20 border-white/5'
                        }`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border ${
                                isCurrent ? 'bg-yellow-500 text-black border-yellow-300' :
                                isUnlocked ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-900 text-slate-600 border-slate-800'
                            }`}>
                                {isUnlocked ? lvl.lvl : <Lock size={16} />}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className={`font-bold ${isCurrent ? 'text-yellow-400' : 'text-white'}`}>{lvl.name}</h4>
                                    <span className="text-[10px] font-mono text-slate-500">{lvl.req.toLocaleString()} XP</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{lvl.reward}</p>
                            </div>
                        </div>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
};
