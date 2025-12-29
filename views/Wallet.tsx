
import React, { useState } from 'react';
import { ShieldCheck, Wallet as WalletIcon, AlertTriangle, Crown, Star, Lock, Info, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Wallet = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'levels'>('balance');

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

  return (
    <div className="max-w-xl mx-auto py-6 px-4 min-h-screen flex flex-col relative">
      <div className="absolute top-6 right-4">
         <a href="https://t.me/anviht" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ExternalLink size={16} />
         </a>
      </div>

      <h1 className="text-3xl font-black italic uppercase text-center mb-6">Кошелек и Уровни</h1>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'balance' ? 'bg-brand text-white shadow-lg' : 'text-slate-400'}`}
          >
             БАЛАНС
          </button>
          <button 
            onClick={() => setActiveTab('levels')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'levels' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400'}`}
          >
             <Crown size={16} /> VIP УРОВНИ
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
                  <p className="text-slate-400 text-sm mb-6">
                      Это виртуальный игровой баланс. Он используется исключительно для развлечения в рамках нашего Social Casino.
                  </p>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                          <Info className="text-blue-400" size={20} />
                          <h3 className="font-bold text-white">Вывод средств</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                          Средства с этого баланса <strong>не подлежат выводу</strong> в реальные деньги. Это очки опыта и статуса.
                      </p>
                  </div>
                  
                  <div className="mt-4 bg-white/5 border border-white/5 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                          <ShieldCheck className="text-green-400" size={20} />
                          <h3 className="font-bold text-white">Авто-пополнение</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                          Если вы проиграли весь баланс, он может быть автоматически пополнен системой (ежедневный бонус или админ-начисление), чтобы вы могли продолжить игру.
                      </p>
                  </div>
              </div>

              <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-red-500">
                    <AlertTriangle size={16} />
                    <h4 className="text-xs font-black uppercase tracking-wider">ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                    Viht Game — это социальный симулятор. Играя здесь, вы соглашаетесь с тем, что валюта не имеет ценности. Разработчики не несут ответственности за ваши эмоции. Только 18+.
                    </p>
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
