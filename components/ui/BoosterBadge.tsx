
import React from 'react';
import { Zap, ShieldCheck, Star } from 'lucide-react';
import { Booster } from '../../types';
import { motion } from 'framer-motion';

interface BoosterBadgeProps {
  booster: Booster | null;
}

export const BoosterBadge: React.FC<BoosterBadgeProps> = ({ booster }) => {
  if (!booster) return null;

  let color = "text-yellow-400";
  let bg = "bg-yellow-500/20 border-yellow-500/50";
  let icon = <Zap size={14} fill="currentColor" />;

  if (booster.id.includes('insurance')) {
      color = "text-blue-400";
      bg = "bg-blue-500/20 border-blue-500/50";
      icon = <ShieldCheck size={14} />;
  } else if (booster.id.includes('xp')) {
      color = "text-purple-400";
      bg = "bg-purple-500/20 border-purple-500/50";
      icon = <Star size={14} />;
  }

  return (
    <motion.div 
       initial={{ y: -20, opacity: 0 }} 
       animate={{ y: 0, opacity: 1 }}
       className={`absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full border flex items-center gap-2 font-bold text-xs backdrop-blur-md shadow-lg ${bg} ${color}`}
    >
        {icon}
        <span className="uppercase tracking-wider">{booster.label}</span>
        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
    </motion.div>
  );
};
