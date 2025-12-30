
import React, { useState } from 'react';
import { 
  Gamepad2, 
  Wallet, 
  Rocket, 
  Bomb, 
  Coins, 
  Home,
  Dices,
  Crown,
  ShoppingBag,
  User,
  Trophy
} from 'lucide-react';
import { View } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  balance: number;
  currentView: View;
  setView: (view: View) => void;
  user?: any; 
  activeDecoration?: string; // CSS class for avatar decoration
}

const ADMIN_ID = 1464327605;

export const Layout: React.FC<LayoutProps> = ({ children, balance, currentView, setView, user, activeDecoration }) => {
  const [showAdminPopup, setShowAdminPopup] = useState(false);

  // Updated Mobile Navigation (Bottom)
  const mobileNavItems = [
    { view: View.HOME, label: 'Кабинет', icon: User },
    { view: View.GAMES_LIST, label: 'Игры', icon: Gamepad2 },
    { view: View.SHOP, label: 'Магазин', icon: ShoppingBag },
    { view: View.LEADERS, label: 'Топ', icon: Trophy },
    { view: View.WALLET, label: 'Кошелек', icon: Wallet },
  ];

  const handleAvatarClick = () => {
    if (user && user.id === ADMIN_ID) {
      setShowAdminPopup(!showAdminPopup);
    } else {
        setView(View.HOME);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex overflow-hidden font-inter selection:bg-brand/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Secret Admin Popup Button */}
      <AnimatePresence>
        {showAdminPopup && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             className="fixed top-20 right-4 z-[60]"
           >
              <button onClick={() => { setView(View.ADMIN); setShowAdminPopup(false); }} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400 animate-bounce">
                  ADMIN PANEL 🛠️
              </button>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen w-full relative z-10">
        
        {/* Glass Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sticky top-0 z-30 bg-[#0f0f11]/60 backdrop-blur-xl border-b border-white/5">
            {/* Left: Logo */}
            <div onClick={() => setView(View.HOME)} className="cursor-pointer active:scale-95 transition-transform">
                <h1 className="font-display font-black italic text-xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    VIHT<span className="text-brand-glow">GAME</span>
                </h1>
            </div>

            {/* Right: Balance & Avatar */}
            <div className="flex items-center gap-3">
                {/* Balance Pill */}
                <div onClick={() => setView(View.WALLET)} className="bg-black/40 border border-white/10 rounded-full pl-1 pr-4 py-1 flex items-center gap-2 cursor-pointer hover:border-brand/50 transition-colors backdrop-blur-md">
                     <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                        <Wallet size={14} className="text-white" />
                     </div>
                     <span className="font-mono font-bold text-sm tracking-tight text-white">
                        {balance.toFixed(0)} ₽
                     </span>
                </div>

                {/* USER AVATAR */}
                <button 
                  onClick={handleAvatarClick}
                  className={`w-9 h-9 rounded-full bg-[#1a1b1e] border border-white/10 relative active:scale-90 transition-transform shadow-lg ${activeDecoration}`}
                >
                   {user?.photo_url ? (
                      <img src={user.photo_url} className="w-full h-full object-cover rounded-full" alt="Profile" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400 rounded-full">
                          {user?.first_name?.[0] || <User size={16} />}
                      </div>
                   )}
                </button>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24">
               {children}
           </div>
        </main>

        {/* Glass Bottom Navigation */}
        <nav className="shrink-0 h-[80px] bg-[#0f0f11]/70 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 pb-safe-area safe-area-bottom z-40 fixed bottom-0 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {mobileNavItems.map((item) => {
                const isActive = currentView === item.view;
                
                return (
                    <button
                        key={item.label}
                        onClick={() => setView(item.view)}
                        className={`flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-all relative ${
                            isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {isActive && (
                            <motion.div 
                                layoutId="nav-glow" 
                                className="absolute inset-0 bg-brand/10 rounded-xl blur-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div className={`relative z-10 p-1 rounded-xl transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                            <item.icon 
                                size={24} 
                                className={`transition-all duration-300 ${isActive ? 'text-brand-glow drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''}`} 
                                strokeWidth={isActive ? 2.5 : 2} 
                            />
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-colors ${isActive ? 'text-white' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                )
            })}
        </nav>

      </div>
    </div>
  );
};
