"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function GameBoard({ board, movePiece, side = 'red' }: Readonly<{ board?: (string | null)[][], movePiece: (from: { row: number; col: number }, to: { row: number; col: number }) => void, side?: 'red' | 'blue' }>) {
  const [selectedTile, setSelectedTile] = React.useState<{ row: number; col: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const rows = 8;
  const cols = 9;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const baseBoard = board || Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  // Rotate board 180 degrees if viewing from blue side
  const displayBoard = side === 'blue' 
    ? baseBoard.map(row => [...row].reverse()).reverse()
    : baseBoard;

  function onTileClick(row: number, col: number) {
    // Convert display coordinates back to actual board coordinates when side is blue
    const actualRow = side === 'blue' ? (rows - 1 - row) : row;
    const actualCol = side === 'blue' ? (cols - 1 - col) : col;
    
    const clickedPiece = displayBoard?.[row]?.[col];
    const isOwnPiece = clickedPiece?.startsWith(`${side}-`);
    
    if (isOwnPiece) {
      if (selectedTile?.row === actualRow && selectedTile?.col === actualCol) {
        setSelectedTile(null);
      } else {
        setSelectedTile({ row: actualRow, col: actualCol });
      }
    } else if (selectedTile) {
      movePiece(selectedTile, { row: actualRow, col: actualCol });
      setSelectedTile(null);
    }
  }

  return (
    <div className="relative">
      {/* Glow effect behind board */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-transparent to-red-500/20 blur-3xl -z-10" />
      
      {/* Board container with frosted glass */}
      <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl ${
        side === 'blue' 
          ? 'border-t-red-500 border-b-blue-500 border-y-4'
          : 'border-t-blue-500 border-b-red-500 border-y-4'
      }`}>
        <div 
          className="grid gap-1 md:gap-1.5"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const isEvenTile = (row + col) % 2 === 0;

            const piece = displayBoard?.[row]?.[col];
            const split = piece ? piece.split("-") : [];
            const pieceSide = piece ? split[0] : null;
            const pieceImage = piece ? `/pieces/${split[1]}.png` : null;
            
            // For visual selection highlight, convert actual coordinates to display coordinates
            const actualRow = side === 'blue' ? (rows - 1 - row) : row;
            const actualCol = side === 'blue' ? (cols - 1 - col) : col;
            const isSelected = selectedTile?.row === actualRow && selectedTile?.col === actualCol;
            
            return (
              <motion.div
                key={`${row}-${col}`}
                initial={mounted ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={mounted ? undefined : { 
                  delay: index * 0.005,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.15 }
                }}
                className={`
                  aspect-square rounded-lg cursor-pointer
                  transition-all duration-200 ease-out
                  ${isEvenTile 
                    ? 'bg-slate-800/60 hover:bg-slate-700/70' 
                    : 'bg-slate-900/60 hover:bg-slate-800/70'
                  }
                  border border-white/5 hover:border-white/20
                  shadow-inner
                  min-w-8 min-h-8
                  md:min-w-11 md:min-h-11
                  lg:min-w-13 lg:min-h-13
                  ${isSelected ? 'ring-2 ring-blue-400' : 'ring-0'}
                `}
                onClick={onTileClick.bind(null, row, col)}
              >
                {piece && 
                  <img 
                    alt={piece} 
                    src={pieceImage || undefined}
                    className="w-full h-full object-contain"
                    style={{
                      filter: (() => {
                        if (pieceSide === 'red') {
                          return 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(1000%) brightness(1.2)';
                        }
                        if (pieceSide === 'blue') {
                          return 'brightness(0.5) sepia(1) hue-rotate(180deg) saturate(1000%) brightness(1.2)';
                        }
                        return undefined;
                      })()
                    }}
                  />
                }
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}