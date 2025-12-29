
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'gold' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-white/10',
    secondary: 'bg-slate-800/50 hover:bg-slate-700/50 text-white backdrop-blur-md border border-white/5',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    gold: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black font-black shadow-[0_0_20px_rgba(234,179,8,0.4)] border border-yellow-300/50',
    outline: 'bg-transparent border border-white/20 text-slate-300 hover:text-white hover:border-white/50 hover:bg-white/5',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold rounded-lg',
    md: 'px-6 py-3 text-sm font-bold rounded-xl',
    lg: 'px-8 py-4 text-lg font-bold rounded-2xl',
    xl: 'px-10 py-5 text-xl font-black rounded-3xl',
  };

  return (
    <button
      className={cn(
        'relative overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] animate-[shine_3s_infinite]" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};
