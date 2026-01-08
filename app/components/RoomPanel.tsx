"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Plus, LogIn, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface RoomPanelProps {
  roomCode: string;
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
}

export default function RoomPanel({ 
  roomCode,
  onCreateRoom,
  onJoinRoom
}: Readonly<RoomPanelProps>) {
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied!');
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      await onCreateRoom();
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (joinCode.length !== 4) {
      toast.error('Please enter a valid 4-character code');
      return;
    }
    setIsJoining(true);
    try {
      await onJoinRoom(joinCode);
    } catch (error) {
      toast.error('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Game Room</h2>
          <p className="text-slate-400 text-sm">Create or join a room</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Create Room Section */}
        <div className="space-y-3">
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="cursor-pointer flex items-center justify-center w-full bg-linear-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white border-0 h-12 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20"
          >
            {isCreating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Create New Room
              </>
            )}
          </button>

          {/* Room Code Display */}
          {roomCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Room Code</p>
                  <p className="text-2xl font-mono font-bold text-white tracking-[0.3em]">
                    {roomCode}
                  </p>
                </div>
                <button
                  onClick={copyRoomCode}
                  className="cursor-pointer flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
          <span className="text-slate-500 text-sm">or</span>
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Join Room Section */}
        <div className="space-y-3">
          <div className="relative">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="Enter room code"
              maxLength={4}
              className="w-full h-12 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-center text-xl font-mono tracking-[0.3em] uppercase focus:border-yellow-500/50 focus:ring-yellow-500/20"
            />
          </div>
          
          <button
            onClick={handleJoinRoom}
            disabled={isJoining || joinCode.length !== 4}
            className="cursor-pointer flex items-center justify-center w-full h-12 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {isJoining ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <LogIn className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Join Room
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}