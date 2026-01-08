"use client";

import { motion } from 'framer-motion';
import { User, Circle, LoaderPinwheel, LoaderCircle, Check } from 'lucide-react';

export default function PlayerInfoCard({ playerName, color, isActive = false, playerState }: Readonly<{ playerName: string; color: 'red' | 'blue'; isActive?: boolean; playerState?: 'preparing' | 'ready' | 'waiting' }>) {
  const isRed = color === 'red';
  
  let activeBorderClass = 'border-white/10';
  if (isActive) {
    activeBorderClass = isRed 
      ? 'border-red-500/50 shadow-lg shadow-red-500/20' 
      : 'border-blue-500/50 shadow-lg shadow-blue-500/20';
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isRed ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        backdrop-blur-xl bg-white/5 
        border rounded-2xl p-5
        transition-all duration-300
        ${activeBorderClass}
      `}
    >
      {/* Accent gradient */}
      <div 
        className={`
          absolute top-0 left-0 right-0 h-1
          ${isRed 
            ? 'bg-linear-to-r from-red-600 via-red-500 to-red-600' 
            : 'bg-linear-to-r from-blue-600 via-blue-500 to-blue-600'
          }
        `}
      />
      
      {/* Glow effect */}
      <div 
        className={`
          absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20
          ${isRed ? 'bg-red-500' : 'bg-blue-500'}
        `}
      />
      
      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div 
          className={`
            relative w-12 h-12 rounded-xl flex items-center justify-center
            ${isRed 
              ? 'bg-linear-to-br from-red-600 to-red-700' 
              : 'bg-linear-to-br from-blue-600 to-blue-700'
            }
            shadow-lg
          `}
        >
          <User className="w-6 h-6 text-white" />
          
          {/* Active indicator */}
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1"
            >
              <Circle className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </motion.div>
          )}
        </div>
        
        {/* Player info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            {isRed ? 'Red Player' : 'Blue Player'}
          </p>
          <div className="text-white font-semibold truncate text-lg flex justify-between items-center">
            <span>{playerName || 'Waiting...'}</span>
            {playerState && (playerState == 'preparing' ?
              <span className="animate-spin">
                <LoaderCircle className="w-5 h-5 text-slate-400" />
              </span>
              :
              <span>
                <Check className="w-5 h-5 text-slate-400" />
              </span>)
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
}