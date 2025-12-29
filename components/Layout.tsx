
import React, { useState } from 'react';
import { 
  Gamepad2, 
  Wallet, 
  Rocket, 
  Bomb, 
  Coins, 
  Plus,
  Home,
  Dices,
  Menu,
  X,
  Crown,
  LogOut
} from 'lucide-react';
import { View } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  balance: number;
  currentView: View;
  setView: (view: View) => void;
  user?: any; 
}

const ADMIN_ID = 1464327605;

export const Layout: React.FC<LayoutProps> = ({ children, balance, currentView, setView, user }) => {
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Mobile Navigation (Bottom)
  const mobileNavItems = [
    { view: View.HOME, label: 'Lobby', icon: Home },
    { view: View.GAMES_LIST, label: 'Games', icon: Dices },
    { view: View.WALLET, label: 'Wallet', icon: Wallet },
  ];

  // Sidebar Items
  const sidebarItems = [
      { view: View.HOME, label: 'Главная', icon: Home },
      { view: View.GAMES_LIST, label: 'Все игры', icon: Gamepad2 },
      { view: View.WALLET, label: 'Кошелек', icon: Wallet },
      { divider: true },
      { view: View.CRASH, label: 'Crash', icon: Rocket, color: 'text-indigo-400' },
      { view: View.MINES, label: 'Mines', icon: Bomb, color: 'text-emerald-400' },
      { view: View.SLOTS, label: 'Slots', icon: Coins, color: 'text-pink-400' },
  ];

  const handleHeaderClick = () => {
    if (user && user.id === ADMIN_ID) {
      setShowAdminPopup(!showAdminPopup);
    } else {
      setView(View.HOME);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-inter selection:bg-brand/30">
      
      {/* Secret Admin Popup Button */}
      <AnimatePresence>
        {showAdminPopup && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
           >
              <button onClick={() => { setView(View.ADMIN); setShowAdminPopup(false); }} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400">
                  OPEN ADMIN PANEL
              </button>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                />
                <motion.div 
                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/5 z-50 flex flex-col p-4 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-2xl font-display font-black italic tracking-tighter">VIHT<span className="text-brand">GAME</span></span>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/5">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        {sidebarItems.map((item: any, idx) => (
                            item.divider ? (
                                <div key={idx} className="h-[1px] bg-white/5 my-2" />
                            ) : (
                                <button 
                                    key={idx}
                                    onClick={() => { setView(item.view); setSidebarOpen(false); }}
                                    className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                                        currentView === item.view 
                                        ? 'bg-white/10 text-white border border-white/5' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <item.icon size={20} className={item.color || ''} />
                                    {item.label}
                                </button>
                            )
                        ))}
                    </div>

                    {user && (
                        <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5 mt-auto">
                            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                                {user.photo_url ? (
                                    <img src={user.photo_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold">{user.first_name?.[0]}</div>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-sm truncate">{user.first_name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {user.id}</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen w-full relative">
        
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-white/5 active:scale-95 transition-transform text-slate-300">
                    <Menu size={24} />
                </button>
                <div onClick={handleHeaderClick} className="cursor-pointer active:scale-95 transition-transform">
                   <h1 className="font-display font-black italic text-xl tracking-tighter text-white">
                      VIHT<span className="text-brand">GAME</span>
                   </h1>
                </div>
            </div>

            {/* Balance Display */}
            <div className="flex items-center gap-2">
                <div onClick={() => setView(View.WALLET)} className="bg-[#0f0f11] border border-white/10 rounded-full pl-1 pr-3 py-1 flex items-center gap-2 cursor-pointer hover:border-brand/50 transition-colors group">
                     <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)] group-hover:scale-110 transition-transform">
                        <Wallet size={12} className="text-white" />
                     </div>
                     <span className="font-mono font-bold text-sm tracking-tight text-white group-hover:text-brand-glow transition-colors">
                        {balance.toFixed(0)} ₽
                     </span>
                </div>
                <button 
                  onClick={() => setView(View.WALLET)}
                  className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all active:scale-90"
                >
                   <Plus size={18} strokeWidth={3} />
                </button>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#050505]">
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               {children}
           </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="shrink-0 h-[70px] bg-[#0a0a0a] border-t border-white/5 flex items-center justify-around px-2 pb-safe-area safe-area-bottom z-40">
            {mobileNavItems.map((item) => {
                const isActive = currentView === item.view || (item.view === View.GAMES_LIST && [View.CRASH, View.MINES, View.SLOTS].includes(currentView));
                
                return (
                    <button
                        key={item.label}
                        onClick={() => setView(item.view)}
                        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all relative ${
                            isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {isActive && (
                            <motion.div layoutId="nav-indicator" className="absolute -top-[1px] w-8 h-[2px] bg-brand shadow-[0_0_10px_#8b5cf6]"></motion.div>
                        )}
                        <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : ''} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                )
            })}
        </nav>

      </div>
    </div>
  );
};
