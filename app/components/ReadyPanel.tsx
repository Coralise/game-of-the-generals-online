"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Plus, LogIn, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ReadyPanelProps {
  setReady: (ready: boolean) => void;
  isReady: boolean;
}

export default function ReadyPanel({ 
  setReady,
  isReady
}: Readonly<ReadyPanelProps>) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <button
            onClick={setReady.bind(null, !isReady)}
            className="cursor-pointer flex items-center justify-center w-full bg-linear-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white border-0 h-12 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20"
          >
            {isReady ? 'Unready' : 'Ready Up'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}