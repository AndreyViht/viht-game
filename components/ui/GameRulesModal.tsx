import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  rules: string[];
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose, title, rules }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl pointer-events-auto relative">
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand-glow shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <Info size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-wide">{title}</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {rules.map((rule, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex shrink-0 items-center justify-center text-xs font-bold text-brand-glow mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 pt-2">
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-brand to-brand-dark rounded-xl font-bold text-white shadow-lg shadow-brand/20 active:scale-95 transition-transform"
                >
                  Понятно, играем!
                </button>
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};