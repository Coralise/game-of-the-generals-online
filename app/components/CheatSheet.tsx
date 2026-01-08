"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scroll, ChevronRight, Minimize2, Maximize2, Sparkles } from 'lucide-react';

export default function CheatSheet() {
  const [isMinimized, setIsMinimized] = useState(false);

  const pieces = [
    { rank: 1, name: '5★ General', image: "/pieces/5gen.png", beats: 'All except Spy' },
    { rank: 2, name: '4★ General', image: "/pieces/4gen.png", beats: 'All below except Spy' },
    { rank: 3, name: '3★ General', image: "/pieces/3gen.png", beats: 'All below except Spy' },
    { rank: 4, name: '2★ General', image: "/pieces/2gen.png", beats: 'All below except Spy' },
    { rank: 5, name: '1★ General', image: "/pieces/1gen.png", beats: 'All below except Spy' },
    { rank: 6, name: 'Colonel', image: "/pieces/col.png", beats: 'All below except Spy' },
    { rank: 7, name: 'Lt. Colonel', image: "/pieces/ltcol.png", beats: 'All below except Spy' },
    { rank: 8, name: 'Major', image: "/pieces/maj.png", beats: 'All below except Spy' },
    { rank: 9, name: 'Captain', image: "/pieces/cap.png", beats: 'All below except Spy' },
    { rank: 10, name: '1st Lt.', image: "/pieces/1lt.png", beats: 'All below except Spy' },
    { rank: 11, name: '2nd Lt.', image: "/pieces/2lt.png", beats: 'All below except Spy' },
    { rank: 12, name: 'Sergeant', image: "/pieces/sgt.png", beats: 'Flag & Private only' },
    { rank: 13, name: 'Private', image: "/pieces/pvt.png", beats: 'Flag & Spy only', special: true },
    { rank: 14, name: 'Spy', image: "/pieces/spy.png", beats: 'All except Private', special: true },
    { rank: 15, name: 'Flag', image: "/pieces/flag.png", beats: 'None', flag: true }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-19' : 'h-125'
      } flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Scroll className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Rank Guide</h3>
            <p className="text-slate-400 text-xs">Quick reference</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="cursor-pointer p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
        >
          {isMinimized ? (
            <Maximize2 className="w-5 h-5" />
          ) : (
            <Minimize2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Special Rules Highlight */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-bold">Special Rules</span>
            </div>
            <ul className="space-y-1 text-xs text-purple-200">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span><strong>Spy</strong> defeats all ranks except Private</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span><strong>Private</strong> is the only piece that can beat Spy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span><strong>Flag</strong> loses to everyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span><strong>Same rank</strong> = both pieces eliminated</span>
              </li>
            </ul>
          </div>

          {/* Pieces List */}
          <div className="space-y-2">
            {pieces.map((piece, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className={`
                  relative overflow-hidden rounded-xl p-3 border transition-all duration-200 hover:scale-[1.02]
                  ${piece.special 
                    ? 'bg-purple-900/20 border-purple-500/30 hover:border-purple-500/50' 
                    : piece.flag 
                      ? 'bg-red-900/20 border-orange-500/30 hover:border-orange-500/50'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white
                  `}>
                    <img src={piece.image} alt={piece.name} />
                  </div>
                  
                  {/* Name and info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">
                      {piece.name}
                      {piece.special && (
                        <span className="ml-2 text-xs text-purple-400">⚡</span>
                      )}
                      {piece.flag && (
                        <span className="ml-2 text-xs text-red-400">⚠️</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-400 text-xs truncate">
                        {piece.beats}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom tip */}
          <div className="mt-4 p-3 bg-slate-900/60 border border-white/10 rounded-xl">
            <p className="text-xs text-slate-400 text-center">
              💡 <strong className="text-slate-300">Tip:</strong> Higher rank number = lower strength (except Spy!)
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}