
import React from 'react';
import { View } from '../types';
import { Rocket, Bomb, Coins, Dices, CircleDot, Disc, Club, LayoutGrid, Search, Box } from 'lucide-react';

interface GamesListProps {
  setView: (view: View) => void;
}

export const GamesList: React.FC<GamesListProps> = ({ setView }) => {
  const games = [
    { id: View.CRASH, name: 'CRASH', icon: Rocket, from: 'bg-indigo-600', to: 'bg-indigo-900', desc: '🚀 Летим на Луну' },
    { id: View.CASES, name: 'CASES', icon: Box, from: 'bg-yellow-600', to: 'bg-yellow-900', desc: '📦 Открой удачу' },
    { id: View.MINES, name: 'MINES', icon: Bomb, from: 'bg-emerald-600', to: 'bg-emerald-900', desc: '💣 Не взорвись' },
    { id: View.SLOTS, name: 'SLOTS', icon: Coins, from: 'bg-pink-600', to: 'bg-pink-900', desc: '🎰 Джекпот тут' },
    { id: View.ROULETTE, name: 'ROULETTE', icon: Disc, from: 'bg-red-600', to: 'bg-red-900', desc: '🔴 Красное/Черное ⚫' },
    { id: View.DICE, name: 'DICE', icon: Dices, from: 'bg-blue-600', to: 'bg-blue-900', desc: '🎲 Шансы 0-100' },
    { id: View.COINFLIP, name: 'COINFLIP', icon: CircleDot, from: 'bg-orange-500', to: 'bg-orange-800', desc: '🦅 Орел или Решка' },
    { id: View.KENO, name: 'KENO', icon: LayoutGrid, from: 'bg-purple-600', to: 'bg-purple-900', desc: '🔢 Угадай числа' },
    { id: View.HILO, name: 'HI-LO', icon: Club, from: 'bg-teal-500', to: 'bg-teal-800', desc: '🃏 Выше или Ниже' },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-30 py-4 border-b border-white/5">
         <h1 className="text-3xl font-display font-black text-white italic tracking-tighter">
            LOBBY
         </h1>
         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Search size={20} className="text-slate-400" />
         </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {games.map((game) => (
          <div 
            key={game.name}
            onClick={() => setView(game.id)}
            className="group relative overflow-hidden rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-lg border border-white/5"
          >
             {/* Card Background Gradient */}
             <div className={`absolute inset-0 bg-gradient-to-br ${game.from} ${game.to} opacity-80`}></div>
             
             {/* Noise Texture */}
             <div className="absolute inset-0 opacity-[0.1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

             <div className="relative p-5 aspect-[4/5] flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:bg-white/20 transition-colors">
                      <game.icon size={24} />
                   </div>
                </div>
                
                <div>
                   <h3 className="font-display font-black text-2xl text-white italic tracking-wide uppercase drop-shadow-md">{game.name}</h3>
                   <p className="text-[10px] text-white/70 font-bold uppercase mt-1 tracking-wider">{game.desc}</p>
                </div>
             </div>
             
             {/* Hover Glow */}
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
